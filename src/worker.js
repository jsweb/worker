export default class WebWorker {
  #threads
  #worker
  #node
  #flow
  #code
  #blob
  #functions
  #scripts
  #unpkg
  #env

  /**
   * Creates WebWorker instance
   *
   * @param {any} data
   * @param {number} threads
   * @param {any} worker
   * @param {boolean} node
   *
   * @memberOf WebWorker
   */
  constructor(data, threads = 2, worker = Worker, node = false) {
    this.data = data

    // Private props
    this.#threads = parseInt(threads, 10)
    this.#worker = worker
    this.#node = node

    this.#code = null
    this.#blob = null

    this.#functions = []
    this.#scripts = []
    this.#unpkg = []
    this.#env = {}

    this.#flow = Promise.resolve(data)
  }

  /**
   * Sets a Worker environment constant attached to 'self.env' object.
   *
   * @param {String|Number} key
   * @param {any} value
   * @returns {WebWorker}
   *
   * @memberOf WebWorker
   */
  env(key, value) {
    this.#env[key] = value

    return this
  }

  /**
   * Import code to use at Worker environment like functions or scripts.
   * Accepts any number of named functions or scripts URLs.
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
   * Import NPM modules from UNPKG CDN to use at Worker environment.
   * Accepts any number of string arguments to identify modules.
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
   * Executes a task function in a single parallel thread.
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
   * Executes a multi-thread Array.map method.
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

      function loop(v, k) {
        if (thread === cluster.length) thread = 0

        return cluster[thread++].postMessage({ v, k })
      }

      return new Promise((done) => {
        function ping(e) {
          proxy[e.data.k] = e.data.v

          return --total || back(done)
        }

        cluster.forEach((wk) => wk.addEventListener('message', ping))

        this.data.forEach((v, k) => this.#asap(loop, v, k))
      })
    })

    return this
  }

  /**
   * Executes a multi-thread Array.reduce method.
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
   * Executes a single parallel thread Array.filter method.
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
   * Executes a single parallel thread Array.sort method.
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
   * Executes a single-thread Array.flat method.
   *
   * @param {Number} depth
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  flat(depth = 1) {
    if (!this.data) return this

    const job = `a => a.flat(${depth})`

    return this.exec(job)
  }

  /**
   * Executes a multi-thread Array.flatMap like method.
   * In fact, this method just chain flat (single-thread) and map (multi-thread) methods.
   * It differs a bit from native Array.flatMap because it allows to set flat depth.
   *
   * @param {Function} task(item, index, array) {}
   * @returns WebWorker
   *
   * @memberOf WebWorker
   */
  flatMap(task, depth = 1) {
    if (!this.data) return this

    return this.flat(depth).map(task)
  }

  /**
   * Promise-like async step.
   * Unlike the native `Promise.then`, which returns a `Promise`, this method returns the `worker` instance to chain another methods.
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
   * Promise-like async last step.
   *
   * @param {Function} task(data) {}
   * @returns {Function} task
   *
   * @memberOf WebWorker
   */
  finally(task) {
    return this.#flow.then(() => task(this.data))
  }

  // Private methods

  #asap(fn, ...args) {
    return this.#node ? setImmediate(fn, ...args) : setTimeout(fn, 1, ...args)
  }

  #getWorker(str) {
    const worker = ['"use strict"']
    const env = JSON.stringify(this.#env)
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

  #getBlobUrl(task) {
    const blob = new Blob([task], {
      type: 'application/javascript',
    })

    this.#blob = URL.createObjectURL(blob)

    return this.#blob
  }

  #setWorker(str) {
    const code = this.#getWorker(str)
    const wk = this.#node ? new Function(code) : this.#getBlobUrl(code)

    return new this.#worker(wk)
  }

  #setCluster(task) {
    const cluster = []
    const worker = this.#setWorker(task)

    for (let i = this.#threads; i > 0; i--) cluster.push(worker)

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
