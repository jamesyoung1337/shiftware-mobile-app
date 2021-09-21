import { observable, configure, action, computed, makeAutoObservable, runInAction } from 'mobx'
import { observer, Provider as MobxProvider } from 'mobx-react-lite'

import axios from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import moment from 'moment-timezone'


class ApplicationState {

    authenticated = false
    token = ''
    username = ''
    email = ''
    profile = {}
    headerColor = ''
    showOnboarding = true // unless we have already run!
    clients = []
    invoices = []
    shifts = {}
    updated = 0
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
          console.log(`Error from /login ${JSON.stringify(error)}`)
          reject(error)
        }

        console.log(`Logged in with ${JSON.stringify(result)}`)
        
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
        this.invoices = []
        this.shifts = {}
        this.showOnboarding = false
  
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
    async loadShiftsForCalendar() {

      return new Promise(async (resolve, reject) => {
        
        let res
        const today = moment(Date.now()).format('YYYY-MM-DD')
        
        try {
          res = await axios.get(`https://shiftware.digital/api/v1/shifts`, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        } catch (error) {
          reject(error)
        }

        console.log(res.data.shifts)
        
        let my_shifts = res.data.shifts
        let calendar_data = {}

        // Calendar data needs to be an object with date keys, containing
        // array of event info
        await my_shifts.map(async (shift, index) => {
          
          let job_start = moment(shift.shift_start).format('YYYY-MM-DD')

          // All these times are accidentally GMT/UTC+0, add 10 to approximate for now
          let start = moment(shift.shift_start).add(10, 'hours')
          let end = moment(shift.shift_end).add(10, 'hours')
          
          console.log(start.format('YYYY-MM-DD HH:MM A'))
          console.log(end.format('YYYY-MM-DD HH:MM A'))
          let hours = end.diff(start, 'hours', false)
          
          // console.log(`Shift start: ${start} Shift end: ${end} Hours: ${hours.toFixed(2)}`)
          // console.log(shift)

          let sh = {}
          Object.assign(sh, shift)
        
          let cli
          try {
            cli = await axios.get(`https://shiftware.digital/api/v1/clients/${shift.client_id}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            })
          } catch (error) {
            reject(error)
          }

          Object.defineProperty(sh, 'client', { writable: true, enumerable: true, value: cli.data.client })

          // Set up phase, put in start, end, and hours
          Object.defineProperty(sh, 'formatted_start', { writable: true, enumerable: true, value: start.format('h:mm a')})
          Object.defineProperty(sh, 'formatted_end', { writable: true, enumerable: true, value: end.format('h:mm a')})
          Object.defineProperty(sh, 'hours', { writable: true, enumerable: true, value: hours.toFixed(2)})

          // console.log(`typeof this.shifts = ${typeof this.shifts}`)
          // console.log(`Key for shift: ${job_start}`)

          if (job_start in this.shifts) {
            // console.log(`Key ${job_start} exists in shifts object, using it`)
            this.shifts[job_start].unshift(sh)
            // console.log(`Length of shifts[job_start] = ${this.shifts[job_start].length}`)
          }
          else {
            // console.log(`Key ${job_start} not in shifts, creating it`)
            let a = []
            a.unshift(sh)
            // console.log(`a is ${typeof a} a.length = ${a.length}`)
            Object.defineProperty(this.shifts, job_start, { writable: true, enumerable: true, value: a })
          }

          // console.log(`sh = ${JSON.stringify(sh, null, 2)}`)
        })

        this.updated += 1
        resolve(this.shifts)
      })
    }

    @action
    async loadInvoices() {
  
      return new Promise( async (resolve, reject) => {
        
        let res
        
        try {
          res = await axios.get('https://shiftware.digital/api/v1/invoices', {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          })
        } catch (error) {
          reject(error)
        }

        let my_invoices = res.data.invoices

        // assign result to this.invoices after processing each one
        my_invoices.map(async (inv, i) => {
            
            let invoice = {}
            invoice = Object.assign(invoice, inv)

            try {
                // console.log(`Client ID: ${inv.client_id}`)
                res = await axios.get(`https://shiftware.digital/api/v1/clients/${inv.client_id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })
            } catch (error) {
                reject(error)
            }

            Object.defineProperty(invoice, 'client', { writable: true, configurable: true, enumerable: true, value: res.data.client })

            // Now fetch invoice details to get subtotal, gst, total
            try {
                // console.log(`Invoice ID: ${inv.id}`)
                res = await axios.get(`https://shiftware.digital/api/v1/invoices/${inv.id}`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })
            } catch (error) {
                reject(error)
            }

            Object.defineProperty(invoice, 'gst', { writable: true, configurable: true, enumerable: true, value: res.data.gst })
            Object.defineProperty(invoice, 'total', { writable: true, configurable: true, enumerable: true, value: res.data.total })
            Object.defineProperty(invoice, 'subtotal', { writable: true, configurable: true, enumerable: true,value: res.data.subtotal })

            // console.log(`inv: ${JSON.stringify(invoice, null, 2)}`)

            this.invoices.push(invoice)
        })

        resolve(this.invoices)
      })
    }

    async invalidToken(token) {
        return new Promise(async (resolve, reject) => {
            try {
                let rc = await axios.get(`https://shiftware.digital/api/v1/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            }
            catch( error ) {
                reject(true)
            }

            resolve(false)
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
