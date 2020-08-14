import { cpus } from 'os'
import Worker from 'tiny-worker'
import WebWorker from './worker'

export default function (data, threads = cpus().length) {
  return new WebWorker(data, threads, Worker, true)
}
