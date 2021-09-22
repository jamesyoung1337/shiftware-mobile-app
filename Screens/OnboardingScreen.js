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

import ApplicationState from '../State/ApplicationState'

import { ApplicationContext, PreferencesContext } from '../Context/Context'

import LoginForm from './LoginForm'

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
            title: 'Welcome to Shiftware!',
            subtitle: 'An app especially for NDIS providers,\nyou can import spreadsheets of shift types and prices',
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
            title: 'Manage Shifts',
            subtitle: 'An integrated shift calendar makes it much easier',
            backgroundColor: '#5e92f3',
            image: (
              <ElementsIcon
                name="calendar-check-o"
                type="font-awesome"
                size={100}
                color="white"
              />
            ),
          },
          {
            title: 'Raise Invoices',
            subtitle: 'Create an invoice, add shifts for a selected client, send!',
            backgroundColor: '#1565c0',
            image: (
              <ElementsIcon name="file-invoice" type="font-awesome-5" size={100} color="white" />
            ),
          },
          {
            title: "Ready to get started?",
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
                  navigation.navigate('Login')
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
  
export default OnboardingScreen
