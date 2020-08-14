import { cpus } from 'os'
import Worker from 'tiny-worker'
import WebWorker from './worker'

export default function (data, options) {
  const threads = cpus().length || 4

  return new WebWorker(data, options, threads, Worker, true)
}
