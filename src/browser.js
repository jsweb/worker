import WebWorker from './worker'

export default function (data, options) {
  const threads = navigator.hardwareConcurrency || 4

  return new WebWorker(data, options, threads, Worker, false)
}
