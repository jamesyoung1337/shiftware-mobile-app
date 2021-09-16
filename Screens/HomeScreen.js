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

import { ApplicationContext } from '../Context/Context'


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

export default HomeScreen
