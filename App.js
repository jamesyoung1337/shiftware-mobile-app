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

import ApplicationState from './State/ApplicationState'
import ClientScreen from './Screens/ClientScreen'
import OnboardingScreen from './Screens/OnboardingScreen'
import MainScreen from './Screens/MainScreen'
import LoginForm from './Screens/LoginForm'
import ProfileScreen from './Screens/ProfileScreen'
import HomeScreen from './Screens/HomeScreen'
import { RosterScreen, events } from './Screens/RosterScreen'
import InvoiceScreen from './Screens/InvoiceScreen'

import SplashScreen from 'react-native-splash-screen'

import { ApplicationContext, PreferencesContext } from './Context/Context'

// for mobx state, ensure it changes only with action method
// never directly outside actions
configure({ enforceActions: true })

const Stack = createNativeStackNavigator()

const CombinedDefaultTheme = merge(PaperDefaultTheme, NavigationDefaultTheme)
const CombinedDarkTheme = merge(PaperDarkTheme, NavigationDarkTheme)


const App = observer(() => {

  const app = useContext(ApplicationContext)
  const [loading, setLoading] = React.useState(false)

  const [isThemeDark, setIsThemeDark] = React.useState(false)
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

    setTimeout(() => {
      SplashScreen.hide()
    }, 3000)
    

    // try {
    //   let result = await app.loadTokenFromAsyncStorage()
    //   console.log(`result from loadTokenFromAsyncStorage: ${result}`)

    //   const rc = await app.invalidToken(result)

    //   if (rc) {
    //     console.log(`Invalid saved token, logging in again`)
    //     try {
    //       result = await app.login('me@jamesyoung.info', 'bella')
    //     }
    //     catch (error) {
    //       // cannot login!?
    //       console.log(`Failed to log in: invalid password?`)
    //     }
    //   }
    // }
    // catch (error) {
    //   // error trying to load from async storage (encrypted)
    //   console.log(`Could not load log in token?!`)
    // }

    action(() => {
      app.headerColor = theme.colors.primary
    })

    console.log(`In app useEffect`)
    
  })

  return (
    <SafeAreaProvider>
      <ApplicationContext.Provider value={app}>
        <PreferencesContext.Provider value={preferences}>
        <PaperProvider theme={theme} settings={{ icon: props => <Icon {...props} /> }}>
          <NavigationContainer theme={theme}>
          <Stack.Navigator screenOptions={{
              headerShown: false,
              headerStyle: {
                backgroundColor: '#6200ee'
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
            { app.showOnboarding && (
              <Stack.Screen name="Wizard" component={OnboardingScreen} />
            )}
            { app.authenticated && (<Stack.Screen name="Main" component={MainScreen} /> )}
            { !app.authenticated && ( <Stack.Screen name="Login" component={LoginForm} /> )}
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
    marginTop: 0,
    height: ScreenHeight
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
    color: '#03dac4',
    fontWeight: 'bold'
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