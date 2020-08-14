export default class WebWorker {
  #options
  #worker
  #node
  #flow
  #code
  #blob
  #functions
  #scripts
  #unpkg

  /**
   * Creates WebWorker instance
   *
   * @param {any} data
   * @param {object} options
   * @param {number} threads
   * @param {any} worker
   * @param {boolean} node
   *
   * @memberOf WebWorker
   */
  constructor(data, options, threads, worker, node) {
    this.data = data

    // Private props
    this.#options = Object.assign(
      {
        max: threads - 1,
        env: {},
      },
      options,
    )

    this.#worker = worker
    this.#node = node

    this.#code = null
    this.#blob = null

    this.#functions = []
    this.#scripts = []
    this.#unpkg = []

    this.#flow = Promise.resolve(data)
  }

  /**
   * Set a Worker enviroment variable attached to 'self.env'
   *
   * @param {String} key
   * @param {any} value
   * @returns {WebWorker}
   *
   * @memberOf WebWorker
   */
  env(key, value) {
    this.#options.env[key] = value

    return this
  }

  /**
   * Import code to use at Worker enviroment like functions or scripts
   * Accepts any number of mixed arguments like scripts path strings,
   * named functions or literal objects
   *
   * @param {any} args
   * @returns {WebWorker}
   *
   * @memberOf WebWorker
   */
  imports(...args) {
    args.forEach((arg) => {
      switch (typeof arg) {
        case 'string':
          this.#scripts.push(`'${arg}'`)
          break

        case 'function':
          this.#functions.push({
            name: arg.name,
            code: arg,
          })
          break

        default:
          this.#functions.push(arg)
          break
      }
    })

    return this
  }

  /**
   * Import NPM modules from UNPKG CDN to use at Worker enviroment
   * Accepts any number of string arguments to identify modules
   *
   * @param {any} args
   * @returns
   *
   * @memberOf WebWorker
   */
  unpkg(...args) {
    this.#unpkg = args.map((path) => `'https://unpkg.com/${path}'`)

    return this
  }

  /**
   * Executes a task with a single parallel thread
   *
   * @param {Function} task(data) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  exec(task) {
    if (!this.data) return this

    this.#flow = this.#flow.then(() => {
      const fn = task.toString()
      const wk = this.#setWorker(fn)

      return new Promise((done) => {
        wk.postMessage(this.data)

        wk.addEventListener('message', (e) => {
          this.data = e.data

          this.#shutdown([wk])

          done(this.data)
        })
      })
    })

    return this
  }

  /**
   * Executes a multi-thread Array.map method
   *
   * @param {Function} task(item, index, array) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  map(task) {
    if (!this.data) return this

    this.#flow = this.#flow.then(() => {
      let total = Number(this.data.length)
      let thread = 0
      let proxy = []

      const exec = 'task(o.v, o.k)'
      const result = '{ v: r, k: o.k }'
      const job = `o => { const task = ${task}, r = ${exec}; return ${result} }`
      const cluster = this.#setCluster(job)
      const back = (done) => {
        this.data = proxy
        this.#shutdown(cluster)

        return done(this.data)
      }

      function ping(e) {
        proxy[e.data.k] = e.data.v

        return --total || back(done)
      }

      function loop(v, k) {
        if (thread === cluster.length) thread = 0

        return cluster[thread++].postMessage({ v, k })
      }

      return new Promise((done) => {
        cluster.forEach((wk) => wk.addEventListener('message', ping))

        this.data.forEach((v, k) => this.#asap(loop, v, k))
      })
    })

    return this
  }

  /**
   * Executes a multi-thread Array.reduce method
   *
   * @param {Function} task(result, item, index, array) {}
   * @param {any} result
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  reduce(task, arg) {
    if (!this.data) return this

    this.#flow = this.#flow.then(() => {
      let total = 0
      let thread = 0
      let limit = 100
      let parts = []
      let proxy = []
      let cluster = []

      const job = `o => o.a.reduce(${task}, o.r)`
      const last = this.#setWorker(job)
      const back = (done, result) => {
        this.#shutdown(cluster.concat(last))
        this.data = result
        return done(this.data)
      }

      function finish(all) {
        if (Array.isArray(all[0])) all = all.reduce((a, i) => a.concat(i), [])

        last.postMessage({ a: all, r: arg })
      }

      function loop(part) {
        if (thread === cluster.length) thread = 0

        return cluster[thread++].postMessage({ a: part, r: arg })
      }

      function ping(e) {
        proxy.push(e.data)
        return --total || finish(proxy)
      }

      return new Promise((done) => {
        last.addEventListener('message', (e) => back(done, e.data))

        if (this.data.length <= limit) return finish(this.data)

        cluster = this.#setCluster(job)

        cluster.forEach((wk) => wk.addEventListener('message', ping))

        while (this.data.length) parts.push(this.data.splice(0, limit))

        total = parseInt(parts.length)

        return parts.forEach((part) => this.#asap(loop, part))
      })
    })

    return this
  }

  /**
   * Executes a single parallel thread Array.filter method
   *
   * @param {Function} task(item) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  filter(task) {
    if (!this.data) return this

    const job = `a => a.filter(${task})`

    return this.exec(job)
  }

  /**
   * Executes a single parallel thread Array.sort method
   *
   * @param {Function} task(a, b) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  sort(task) {
    if (!this.data) return this

    const job = `a => a.sort(${task})`

    return this.exec(job)
  }

  /**
   * Executes a multi-thread Array.flatMap method
   *
   * @param {Function} task(item, index, array) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  flatMap(task) {
    if (!this.data) return this

    return this.exec((data) => data.flatMap((i) => i)).map(task)
  }

  /**
   * Async step Promise-like then
   *
   * @param {Function} task(data) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  then(task) {
    this.#flow = this.#flow.then(() => task(this.data))

    return this
  }

  /**
   * Async step Promise-like then, but finishes all instance operations
   *
   * @param {Function} task(data) {}
   * @returns {Function} task
   *
   * @memberOf WebWorker
   */
  finally(task) {
    this.#flow.then(() => task(this.data))
  }

  // Private methods

  #asap(fn, ...args) {
    return this.#node ? setImmediate(fn, ...args) : setTimeout(fn, 1, ...args)
  }

  #getWorker(str) {
    const worker = ['"use strict"']
    const env = JSON.stringify(this.#options.env)
    const scripts = this.#scripts.join(',')
    const unpkg = this.#unpkg.join(',')
    const footer = [
      `const env = ${env}, job = ${str};`,
      'self.addEventListener("message", e => {',
      'const result = job(e.data);',
      'self.postMessage(result);',
      '})',
    ].join(' ')

    if (scripts.length) worker.push(`importScripts(${scripts})`)

    if (unpkg.length) worker.push(`importScripts(${unpkg})`)

    this.#functions.forEach((fn) => {
      const func = fn.name
        ? `const ${fn.name} = ${fn.code}`
        : fn.code.toString()

      worker.push(func)
    })

    this.#code = worker.concat(footer).join('\n')

    return this.#code
  }

  #getBlobUrl(wk) {
    const blob = new Blob([wk], {
      type: 'application/javascript',
    })

    this.#blob = URL.createObjectURL(blob)

    return this.#blob
  }

  #setWorker(str) {
    const code = this.#code || this.#getWorker(str),
      wk = this.#node
        ? new Function(code)
        : this.#blob || this.#getBlobUrl(code)
    return new this.#worker(wk)
  }

  #setCluster(task) {
    const cluster = []

    for (let i = parseInt(this.#options.max); i > 0; i--)
      cluster.push(this.#setWorker(task))

    return cluster
  }

  #shutdown(cluster) {
    this.#code = null

    cluster.forEach((wk) => wk.terminate())

    if (this.#blob) {
      URL.revokeObjectURL(this.#blob)
      this.#blob = null
    }
  }
}
