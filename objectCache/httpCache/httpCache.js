class HttpCache {
  constructor() {
    this.httpsMap = new Map();
  }

  add(seq, {req, res}) {
    if (this.httpsMap.has(seq)) {
      return -1;
    } else {
      this.httpsMap.set(seq, {req, res});
      return seq;
    }
  }

  find(seq) {
    const result = this.httpsMap.get(seq);
    if (result === undefined) {
      return -1;
    } else {
      return result;
    }
  }

  del(seq) {
    if (this.httpsMap.has(seq)) {
      if (this.httpsMap.delete(seq))
        return seq;
      else
        return -1;
    } else
      return -1;
  }
}

module.exports = HttpCache;