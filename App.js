import 'react-native-gesture-handler'

import React, { useCallback, useEffect, useState, createContext, useContext } from 'react'

import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native'

import { View, StyleSheet, Alert, FlatList, TouchableOpacity, SafeAreaView } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { DarkTheme as PaperDarkTheme, Card, Avatar, Button as MaterialButton, Snackbar, 
  DefaultTheme as PaperDefaultTheme, Paragraph, Provider as PaperProvider, Portal, Modal, Dialog,
  ActivityIndicator, Colors, List, Title, Headline, Subheading, Caption, Banner, FAB } from 'react-native-paper'

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Button, Text, Icon as ElementsIcon, ListItem, Input,
  Avatar as ElementsAvatar } from 'react-native-elements'

import { useFocusEffect } from '@react-navigation/native'

import merge from 'deepmerge'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHome, faCalendarAlt, faUsers, faFileInvoiceDollar, faEnvelope, faLock, faSignInAlt,
faIdCard, faIdCardAlt, faIdBadge, faAt, faFont, faSave } from '@fortawesome/free-solid-svg-icons'

import Icon from 'react-native-vector-icons/FontAwesome5'

// Only for items that are not particularly sensitive
import AsyncStorage from '@react-native-async-storage/async-storage'

import EncryptedStorage from 'react-native-encrypted-storage'

import axios from 'axios'
import { Formik } from 'formik'
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers'

import Onboarding from 'react-native-onboarding-swiper'

import { observable, configure, action, computed, makeAutoObservable, runInAction } from 'mobx'
import { observer, Provider as MobxProvider } from 'mobx-react-lite'

// for mobx state, ensure it changes only with action method
// never directly outside actions
configure({ enforceActions: true })


class ApplicationState {

  authenticated = false
  token = ''
  username = ''
  email = ''
  profile = {}
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

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// default app state context
const ApplicationContext = createContext(new ApplicationState())


const OnboardingScreen = observer(({ navigation }) => {
  const app = useContext(ApplicationContext)

  React.useEffect(async () => {
    console.log(`useEffect of OnboardingScreen`)
  }, [])

  return (
    <Onboarding
      showDone={false}
      onSkip={() => Alert.alert('Skipped')}
      pages={[
        {
          title: 'Hey!',
          subtitle: 'Welcome to $App!',
          backgroundColor: '#003c8f',
          image: (
            <ElementsIcon
              name="hand-peace-o"
              type="font-awesome"
              size={100}
              color="white"
            />
          ),
        },
        {
          title: 'Send Messages',
          subtitle: 'You can reach everybody with us',
          backgroundColor: '#5e92f3',
          image: (
            <ElementsIcon
              name="paper-plane-o"
              type="font-awesome"
              size={100}
              color="white"
            />
          ),
        },
        {
          title: 'Get Notified',
          subtitle: 'We will send you notification as soon as something happened',
          backgroundColor: '#1565c0',
          image: (
            <ElementsIcon name="bell-o" type="font-awesome" size={100} color="white" />
          ),
        },
        {
          title: "That's Enough",
          subtitle: (
            <Button
              title={'Get Started'}
              containerViewStyle={{ marginTop: 20 }}
              backgroundColor={'white'}
              borderRadius={5}
              textStyle={{ color: '#003c8f' }}
              onPress={ async () => {
                // remove showOnboarding
                // why can I do this outside an action with strict mode??
                app.showOnboarding = false
                navigation.navigate('Main')
              }}
            />
          ),
          backgroundColor: '#003c8f',
          image: (
            <ElementsIcon name="rocket" type="font-awesome" size={100} color="white" />
          ),
        },
      ]}
    />
  )
})


export const PreferencesContext = React.createContext({
  toggleTheme: () => {},
  isThemeDark: false,
})

const CombinedDefaultTheme = merge(PaperDefaultTheme, NavigationDefaultTheme)
const CombinedDarkTheme = merge(PaperDarkTheme, NavigationDarkTheme)

const MainScreen = observer(({ navigation }) => {
  
  const app = useContext(ApplicationContext)

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = faHome
        } else if (route.name === 'Roster') {
          iconName = faCalendarAlt
        } else if (route.name === 'Clients') {
          iconName = faUsers
        } else if (route.name === 'Invoices') {
          iconName = faFileInvoiceDollar
        }

        // You can return any component that you like here!
        return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
      },
      // headerStyle: {
      //   backgroundColor: '#1a77ff',
      // },
      // headerTintColor: '#fff',
      // headerTitleStyle: {
      //   fontWeight: 'bold',
      // },
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Roster" component={RosterScreen} />
    <Tab.Screen name="Clients" component={ClientScreen} />
    <Tab.Screen name="Invoices" component={InvoiceScreen} />
  </Tab.Navigator>
  )
})

const LeftContent = props => <Avatar.Icon {...props} icon='id-card' />

const LoginForm = observer(() => {
  
  const app = useContext(ApplicationContext)

  const [loading, setLoading] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const onToggleSnackBar = () => setVisible(!visible)
  const onDismissSnackBar = () => setVisible(false)

  React.useEffect(async () => {
    console.log(`useEffect of LoginForm`)
  }, [])

  return (
    <>
    <View style={styles.container}>
    { loading && (
      <ActivityIndicator animating={true} color={Colors.green500} />
    )}
    { !loading && !app.authenticated && (
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={ async (values) => {
          // console.log(values)
          setLoading(true)
          app.login(values.email, values.password).then(() => {
            setLoading(false)
          })
          .catch((e) => {
            setVisible(true)
          })
        }}
        >
        {({ handleChange, handleBlur, handleSubmit, values }) => (
          <View style={styles.form}>
            <Input
              placeholder='name@email.com'
              label='Your Email Address'
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType='email-address'
              leftIcon={
                <FontAwesomeIcon
                  icon={faEnvelope}
                  size={24}
                  color='black'
                />}
            />
            <Input
              placeholder='password'
              label='Password'
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry={true}
              keyboardType='default'
              leftIcon={
                <FontAwesomeIcon
                  icon={faLock}
                  size={24}
                  color='black'
                />}
            />
            <Button
              icon={
                <Icon
                  name='sign-in-alt'
                  size={25}
                  color="white"
                />
              }
              title=" Login"
              onPress={handleSubmit}
              containerStyle={{ width: 300 }}
            />
          </View>
        )}
      </Formik>
    )}

    {/* { !loading && app.authenticated && (
      <Card style={{ elevation: 5, width: ScreenWidth - 40, borderRadius: 10, alignSelf: 'center' }}>
      <Card.Title title="Profile" left={LeftContent} />
      <Card.Content>
        <Text h4 style={styles.headerColor}>Business Name</Text>
        <Paragraph>{ app.profile.business }</Paragraph>
        <Text h4 style={styles.headerColor}>ABN</Text>
        <Paragraph>{ app.profile.abn }</Paragraph>
        <Text h4 style={styles.headerColor}>Address</Text>
        <Paragraph>{ app.profile.address }</Paragraph>
        <Text h4 style={styles.headerColor}>Suburb</Text>
        <Paragraph>{ app.profile.suburb }</Paragraph>
        <Text h4 style={styles.headerColor}>State</Text>
        <Paragraph>{ app.profile.state }</Paragraph>
        <Text h4 style={styles.headerColor}>Postcode</Text>
        <Paragraph>{ app.profile.postcode }</Paragraph>
      </Card.Content>
      <Card.Actions>
        <MaterialButton onPress={async () => {
          setLoading(true)
          await app.logout()
          setLoading(false)
          }}>Clear Session</MaterialButton>
      </Card.Actions>
      </Card>
    )} */}

    </View>

    <Snackbar
      visible={visible}
      onDismiss={onDismissSnackBar}
      action={{
        label: 'OK',
        onPress: () => {
          // Do something
        },
    }}>
    Login Failed. Please try again!
    </Snackbar>
    </>
  )
})

const ProfileScreen = observer(({ navigation }) => {
  
  const app = useContext(ApplicationContext)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(async() => {
    console.log(`useEffect of ProfileScreen`)

    setLoading(true)
    await app.loadProfile()
    setLoading(false)
  }, [])

  return (
    <View style={styles.container}>
      { loading && (
        <ActivityIndicator animating={true} color={Colors.green500} />
      )}
      { !loading && app.authenticated && (
      <Card style={{ elevation: 5, width: ScreenWidth - 40, borderRadius: 10, alignSelf: 'center' }}>
      <Card.Title title="Profile" left={LeftContent} />
      <Card.Content>
        <Text h4 style={styles.headerColor}>Business Name</Text>
        <Paragraph>{ app.profile.business }</Paragraph>
        <Text h4 style={styles.headerColor}>ABN</Text>
        <Paragraph>{ app.profile.abn }</Paragraph>
        <Text h4 style={styles.headerColor}>Address</Text>
        <Paragraph>{ app.profile.address }</Paragraph>
        <Text h4 style={styles.headerColor}>Suburb</Text>
        <Paragraph>{ app.profile.suburb }</Paragraph>
        <Text h4 style={styles.headerColor}>State</Text>
        <Paragraph>{ app.profile.state }</Paragraph>
        <Text h4 style={styles.headerColor}>Postcode</Text>
        <Paragraph>{ app.profile.postcode }</Paragraph>
      </Card.Content>
      <Card.Actions>
        <MaterialButton onPress={async () => {
          setLoading(true)
          // Clear session/reload/whatever?
          setLoading(false)
          }}>Clear Session</MaterialButton>
      </Card.Actions>
      </Card>
    )}
    </View>
  )
})

// Login or show profile
const HomeScreen = observer(({ navigation }) => {
  
  const app = useContext(ApplicationContext)
  
  React.useEffect(async () => {
    console.log(`useEffect of HomeScreen`)
    console.log(app)
  }, [])
  
  return (
    <View style={styles.container}>
      { !app.authenticated && <LoginForm /> }
      { app.authenticated && <ProfileScreen /> }
    </View>
  )
})

const RosterScreen = observer(({ navigation }) => {
  const app = useContext(ApplicationContext)
  return (
    <View style={styles.container}>
      <Text h3>Roster</Text>
    </View>
  )
})

const ClientScreen = observer(({ navigation }) => {

  const app = useContext(ApplicationContext)

  const [clients, setClients] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [reload, setReload] = React.useState(1)

  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const keyExtractor = (item, index) => index.toString()

  const getTitle = (el) => {
    if (typeof el === 'undefined' || el === null)
      return 'C'
    names = el.split(' ')
    if (names === null || names.length < 2)
      return 'C'
    return names[0][0] + names[1][0]
  }

  React.useEffect(async() => {

    console.log(`useEffect of ClientScreen`)

    let c
    try {
      c = await app.loadClients()
      setClients(c)
    }
    catch (error) {
      //
    }

    setLoading(false)

  }, [reload])

  const [selectedId, setSelectedId] = useState(null)

  const renderItem = ({ item }) => {

    const backgroundColor = item.id === selectedId ? '#03dac4' : '#f6f6f6';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <TouchableOpacity onPress={() => setSelectedId(item.id)}>
      <List.Item
        title={item.name}
        description={item.email}
        key={item.id}
        style={{ width: ScreenWidth - 40, color: color, backgroundColor: backgroundColor }}
        left={props => <Avatar.Text label={getTitle(item.name)} size={32} style={{ alignSelf: 'center' }} />}
      />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.clientView}>
      <Portal>
        <Formik
          initialValues={{ name: '', email: '' }}
          onSubmit={async (values) => {
            // console.log(values)
            try {
              let result = await axios.post('https://shiftware.digital/api/v1/clients',
              { name: values.name, email: values.email },
              {
                headers: {
                  'Authorization': `Bearer ${app.token}`
                }
              })
              // console.log(result)
              setReload(reload + 1)
            } catch (error) {
              console.log(error)
            }
            hideModal()
          }}
        >
        {({ handleChange, handleBlur, handleSubmit, values }) => (
        <Dialog visible={visible} onDismiss={hideModal} style={styles.dialog}>
          <Dialog.Title>Add client</Dialog.Title>
          <Dialog.Content>
              <View style={styles.form}>
                <Input
                  placeholder='name@email.com'
                  label='Client email'
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType='email-address'
                  leftIcon={
                    <FontAwesomeIcon
                      icon={faAt}
                      size={24}
                      color='black'
                    />}
                />
                <Input
                  placeholder='name'
                  label='Client Name'
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  keyboardType='default'
                  leftIcon={
                    <FontAwesomeIcon
                      icon={faFont}
                      size={24}
                      color='black'
                    />}
                />
              </View>
          </Dialog.Content>
          <Dialog.Actions>
            <MaterialButton onPress={handleSubmit}>Save</MaterialButton>
          </Dialog.Actions>
          </Dialog>
          )}
          </Formik>
      </Portal>
      { loading && (
        <ActivityIndicator animating={true} color={Colors.green500} />
      )}
      { !loading && (
        <SafeAreaView style={styles.container}>
          <FlatList
            data={clients}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            extraData={selectedId}
          />
        </SafeAreaView>
      )}
      <FAB
        style={styles.fab}
        size={64}
        icon="plus"
        onPress={() => showModal()}
      />
    </View>
  )
})

const InvoiceScreen = observer(({ navigation }) => {
  const app = useContext(ApplicationContext)
  return (
    <View style={styles.container}>
      <Text h3>Invoices</Text>
    </View>
  )
})

const App = observer(() => {

  const app = useContext(ApplicationContext)

  const [isThemeDark, setIsThemeDark] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  let theme = isThemeDark ? CombinedDarkTheme : CombinedDefaultTheme

  const toggleTheme = React.useCallback(() => {
    return setIsThemeDark(!isThemeDark)
  }, [isThemeDark])

  const preferences = React.useMemo(
    () => ({
      toggleTheme,
      isThemeDark,
    }),
    [toggleTheme, isThemeDark]
  )

  useEffect(async () => {
    // // Run once
    // try {
    //   await app.loadTokenFromAsyncStorage()
    //   // logs us in automagically
    // }
    // catch (error) {
    //   // Neaky login and save token and stuff!
    //   let result = await app.login('jamesyoung1337@outlook.com', 'netcons')
    // }

    // console.log(app)

    let result

    try {
      result = await app.loadTokenFromAsyncStorage()
      console.log(`result from loadTokenFromAsyncStorage: ${result}`)

      if (result === null) {
        try {
          result = await app.login('jamesyoung1337@outlook.com', 'netcons')
          console.log(`result from login: ${result}`)
        }
        catch (error) {
          // cannot login!?
        }
      }
    }
    catch (error) {
      // error trying to load from async storage (encrypted)
    }

    console.log(`In app useEffect`)
    
  }, [])

  return (
    <SafeAreaProvider>
      <ApplicationContext.Provider value={app}>
        <PreferencesContext.Provider value={preferences}>
        <PaperProvider theme={theme} settings={{ icon: props => <Icon {...props} /> }}>
          <NavigationContainer theme={theme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            { app.showOnboarding && (
              <Stack.Screen name="Wizard" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Main" component={MainScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </PaperProvider>
        </PreferencesContext.Provider>
      </ApplicationContext.Provider>
    </SafeAreaProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  clientView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    height: ScreenHeight - 50
  },
  containerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: ScreenWidth - 40,
    marginLeft: 20,
    marginRight: 20,
  },
  headerColor: {
    color: '#f62252'
  },
  form: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  dialog: {
    width: ScreenWidth - 40,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  }
})

export default App