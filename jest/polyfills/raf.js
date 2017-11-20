// eslint-disable-next-line
const raf = global.requestAnimationFrame = cb => {
  setTimeout(cb, 0)
}

export default raf