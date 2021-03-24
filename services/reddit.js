const axios = require('axios')
const querystring = require('querystring')

class reddit {
  connect(client_id, client_secret, redirect_uri) {
    this.client_id = client_id
    this.client_secret = client_secret
    this.redirect_uri = redirect_uri
  }

  async getToken(code) {
    const res = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      querystring.stringify({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirect_uri,
      }),
      {
        auth: {
          username: this.client_id,
          password: this.client_secret,
        },
      }
    )
    if (res.data.error) throw { code: 400, message: 'Invalid code' }
    return res.data.access_token
  }

  async getUserInfo(token) {
    try {
      const res = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `bearer ${token}`,
        },
      })
      return res.data
    } catch (ex) {
      if (ex.message && ex.message.endsWith('403')) throw { code: 401 }
      if (ex.message && ex.message.endsWith('401')) throw { code: 401 }
      throw ex
    }
  }

  async getSubredditInfo(token, subreddit) {
    try {
      const res = await axios.get(`https://oauth.reddit.com/r/${subreddit}/about`, {
        headers: {
          Authorization: `bearer ${token}`,
        },
      })
      if (res.data?.kind !== 't5') throw { code: 404, message: 'Invalid subreddit' }
      return res.data.data
    } catch (ex) {
      if (ex.message && ex.message.endsWith('403')) throw { code: 401 }
      if (ex.message && ex.message.endsWith('401')) throw { code: 401 }
      throw ex
    }
  }
}

module.exports = new reddit()
