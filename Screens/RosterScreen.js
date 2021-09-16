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

import EventCalendar from '../EventCalendar/EventCalendar'

import { ApplicationContext } from '../Context/Context'

const events = [
    { start: '2021-09-07 00:30:00', end: '2021-09-07 01:30:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-07 01:30:00', end: '2021-09-07 02:20:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-07 04:10:00', end: '2021-09-07 04:40:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-07 01:05:00', end: '2021-09-07 01:45:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-07 14:30:00', end: '2021-09-07 16:30:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-08 01:20:00', end: '2021-09-08 02:20:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-08 04:10:00', end: '2021-09-08 04:40:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-08 00:45:00', end: '2021-09-08 01:45:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-08 11:30:00', end: '2021-09-08 12:30:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-09 01:30:00', end: '2021-09-09 02:00:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-09 03:10:00', end: '2021-09-09 03:40:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' },
    { start: '2021-09-09 00:10:00', end: '2021-09-09 01:45:00', title: 'Dr. Mariana Joseph', summary: '3412 Piedmont Rd NE, GA 3032' }
]
  
const RosterScreen = observer(({ navigation }) => {
    const app = useContext(ApplicationContext)
    return (
      app.authenticated && <EventCalendar
        eventTapped={(event) => console.log(`Event tap: ${JSON.stringify(event)}`)}
        events={events}
        width={ScreenWidth}
        initDate={'2021-09-08'}
      />
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

export { RosterScreen, events }
