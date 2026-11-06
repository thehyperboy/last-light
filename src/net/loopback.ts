import type { NetMsg } from './protocol'

type Sink = (msg: NetMsg) => void

/** In-process ordered link for protocol tests. Not a substitute for WebRTC on devices. */
export function pairLoopback() {
  let a: Sink = () => undefined
  let b: Sink = () => undefined
  return {
    attachA(handler: Sink) {
      a = handler
    },
    attachB(handler: Sink) {
      b = handler
    },
    sendA(msg: NetMsg) {
      b(msg)
    },
    sendB(msg: NetMsg) {
      a(msg)
    },
  }
}
