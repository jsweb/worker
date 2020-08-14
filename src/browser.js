import WebWorker from './worker'

export default function (data, threads = navigator.hardwareConcurrency) {
  return new WebWorker(data, threads)
}
