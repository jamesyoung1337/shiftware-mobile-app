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

const LoginForm = observer(() => {
  
    const app = useContext(ApplicationContext)
  
    const [loading, setLoading] = React.useState(false)
    const [visible, setVisible] = React.useState(false)
    const onToggleSnackBar = () => setVisible(!visible)
    const onDismissSnackBar = () => setVisible(false)
    const [loginFailed, setLoginFailed] = React.useState(false)
  
    React.useEffect(async () => {
      console.log(`useEffect of LoginForm`)
      // console.log(JSON.stringify(app, null, 2))
    }, [])

    const login = async (values) => {
        setLoading(true)
        // clear all data when logging in
        await app.logout(false)
        let rc = await app.login(values.email, values.password)
        if (!rc) {
            setLoginFailed(true)
            // onToggleSnackBar()
            console.log(`Could not login: ${rc}`)
        }
        setLoading(false)
        if (!loginFailed) {
          console.log(JSON.stringify(app, null, 2))
        }
    }
  
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
            await login(values)
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

export default LoginForm
