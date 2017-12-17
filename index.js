const http = require('superagent')

require('superagent-proxy')(http)

/**
 * @class CryptoWatch
 * Wrapper for cryptowat.ch api
 */

class CryptoWatch {

  /**
   * @constructor
   */

  constructor(proxies) {
    this.url = 'https://api.cryptowat.ch'
    this.proxies = proxies || []
  }

  /**
   * Request helper function
   * @private
   */

  request(endpoint) {
    return new Promise((resolve, reject) => {
      const url = `${this.url}/${endpoint}`

      if (this.proxies && this.proxies.length > 0) {
        const randomProxy = this.proxies[Math.floor(Math.random()* this.proxies.length)]

        http
          .get(url)
          .proxy(randomProxy)
          .end((err, res) => {
            if (err) {
              reject({
                message: 'Request failed',
                error: String(err),
                url
              })
            } else {
              resolve(res.body.result)
              this.allowanceRemaining = res.body.allowance.remaining
            }
          })
      } else {
        http
          .get(url)
          .end((err, res) => {
            if (err) {
              reject({
                message: 'Request failed',
                error: String(err),
                url
              })
            } else {
              resolve(res.body.result)
              this.allowanceRemaining = res.body.allowance.remaining
            }
          })
      }
    })
  }

  /**
   * Gets remaining api allowance.
   */

  allowance() {
    return this.allowanceRemaining
  }

  /**
   * Gets all assets (crypto or fiat currency).
   */

  assets() {
    return this.request('assets')
  }

  /**
   * Gets an asset's information.
   *
   * @param {String} name
   */

  asset(name) {
    return this.request(`assets/${name}`)
  }

  /**
   * Gets currency pairs info.
   */

  pairs() {
    return this.request('pairs')
  }

  /**
   * Gets info for a currency pair.
   *
   * @param {String} name
   */

  pair(name) {
    return this.request(`pairs/${name}`)
  }

  /**
   * Gets info for all the exchanges.
   *
   * @param {Boolean} [active] If true, only return active exchanges
   */

  exchanges(active = true) {
    return new Promise((resolve, reject) => {
      this.request('exchanges').then((exchanges) => {
        if (active) {
          exchanges = exchanges.filter((e) => e.active)
        }
        resolve(exchanges)
      }).catch(reject)
    })
  }

  /**
   * Gets info for an exchange.
   *
   * @param {String} name
   */

  exchange(name) {
    return this.request(`exchanges/${name}`)
  }

  /**
   * Gets info for markets. Optionally specify a single exchange.
   *
   * @param {String} [exchange] Optional. Supply a specific exchange to get
   * markets for
   */

  markets(exchange = '') {
    let endpoint = 'markets'
    if (exchange.length > 0) {
      endpoint = `${endpoint}/${exchange}`
    }
    return this.request(endpoint)
  }

  /**
   * Gets info for a market given an exchange and pair.
   *
   * @param {String} exchange
   * @param {String} pair
   */

  market(exchange, pair) {
    return this.request(`markets/${exchange}/${pair}`)
  }

  /**
   * Returns price for a given market and currency pair.
   *
   * @param {String} market
   * @param {String} pair
   */

  price(market, pair) {
    return this.request(`markets/${market}/${pair}/price`)
  }

  /**
   * Aggregate endpoint that returns the current price for all supported
   * markets. Somes values may be out of date by a few seconds as results
   * are cached.
   */

  prices() {
    return this.request('markets/prices')
  }

  /**
   * Returns summary for a given market and currency pair.
   *
   * @param {String} market
   * @param {String} pair
   */

  summary(market, pair) {
    return this.request(`markets/${market}/${pair}/summary`)
  }

  /**
   * Aggregate endpoint that returns the market summary for all supported
   * markets. Some values may be out of date by a few seconds as results are
   * cached.
   */

  summaries() {
    return this.request('markets/summaries')
  }

  /**
   * Returns trades for a given market and currency pair.
   *
   * @param {String} market
   * @param {String} pair
   */

  trades(market, pair) {
    return this.request(`markets/${market}/${pair}/trades`)
  }

  /**
   * Returns the orderbook for a given market and currency pair.
   *
   * @param {String} market
   * @param {String} pair
   */

  orderbook(market, pair) {
    return this.request(`markets/${market}/${pair}/orderbook`)
  }

  /**
   * Returns a market’s OHLC candlestick data. Returns data as lists of lists
   * of numbers for each time period integer.
   *
   * @param {String} market
   * @param {String} pair
   */

  OHLC(market, pair) {
    return this.request(`markets/${market}/${pair}/ohlc`)
  }
}

module.exports = CryptoWatch
