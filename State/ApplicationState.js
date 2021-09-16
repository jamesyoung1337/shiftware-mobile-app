import { observable, configure, action, computed, makeAutoObservable, runInAction } from 'mobx'
import { observer, Provider as MobxProvider } from 'mobx-react-lite'

class ApplicationState {

    authenticated = false
    token = ''
    username = ''
    email = ''
    profile = {}
    headerColor = ''
    showOnboarding = true // unless we have already run!
    clients = []
    // client state, and schedule/roster and invoices
    // should really be local state, right?
  
    constructor() {
      makeAutoObservable(this)
    }
  
    @action
    async login(email, pass) {
  
      return new Promise( async(resolve, reject) => {
  
        this.email = email
      
        let result;
        try {
          result = await axios.post('https://shiftware.digital/api/v1/login', { email: email, password: pass })
        }
        catch (error) {
          this.logout(false)
          // console.log(`Error from /login ${JSON.stringify(err)}`)
          reject(error)
        }
        
        this.authenticated = true
        this.token = result.data.token
          
        let storeResult = await this.storeTokenInAsyncStorage(this.token)
            
        if (!storeResult) {
          await this.logout(true)
          reject('Failed to store login token')
        }
        
        resolve(true)
  
      })
      
    }
  
    @action
    async loadProfile() {
  
      return new Promise( async (resolve, reject) => {
  
        let result;
        try {
          result = await axios.get('https://shiftware.digital/api/v1/profile', {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        }
        catch (error) {
          this.logout(false)
          // console.log(`Error from /login ${JSON.stringify(err)}`)
          reject(error)
        }
  
        this.profile = result.data.profile
  
        resolve(this.profile)
      })
    }
  
    @action
    async logout(callApi) {
      return new Promise( async (resolve, reject) => {
  
        this.authenticated = false
        this.token = ''
        this.username = ''
        this.email = ''
        this.profile = {}
        this.clients = []
  
        if (callApi) {
          try {
            await axios.get('https://shiftware.digital/api/v1/logout', {
              headers: {
                'Authorization': `Bearer ${this.token}`
              }
            })
          }
          catch (error) {
            reject(error)
          }
        }
  
        resolve()
      })
      
    }
  
    @action
    async loadClients() {
  
      return new Promise( async (resolve, reject) => {
        
        let res
        
        try {
          res = await axios.get('https://shiftware.digital/api/v1/clients', {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        } catch (error) {
          reject(error)
        }
        
        this.clients = res.data.clients
        resolve(this.clients)
      })
    }
  
    @action
    async loadTokenFromAsyncStorage() {
      
      return new Promise( async (resolve, reject) => {
  
        try {   
          const session = await EncryptedStorage.getItem("@app_login_token");
      
          if (session !== undefined) {
  
            // console.log(`Session: ${JSON.stringify(session)}`)
            let session_object = JSON.parse(session)
  
            // Get username, email and whatever from here... for the
            // global ApplicationState
            this.token = session_object.token
            this.authenticated = true
            this.showOnboarding = false
  
            resolve(session)
          }
  
          // reject without error message just means that the token
          // is not stored
          reject()
  
        }
        catch (error) {
            // There was an error on the native side
            reject(error)
        }
  
      })
    }
  
    async storeTokenInAsyncStorage(token) {
      
      return new Promise( async (resolve, reject) => {
  
        try {
          
          await EncryptedStorage.setItem(
              "@app_login_token",
              JSON.stringify({
                  token: token,
                  datetime: Date.now()
              })
          )
        }
        catch (error) {
            // There was an error on the native side
            reject(error)
        }
  
        resolve(true)
      })
    }
  
    @action
    setProfile(p) {
      this.profile = p
    }
}

export default ApplicationState
