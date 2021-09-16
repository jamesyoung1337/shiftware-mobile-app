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



const ProfileScreen = observer(({ navigation }) => {
  
    const app = useContext(ApplicationContext)
    const [loading, setLoading] = React.useState(false)
  
    React.useEffect(async() => {
      console.log(`useEffect of ProfileScreen`)
  
      setLoading(true)
      await app.loadProfile()
      setLoading(false)
    }, [])
    
    const LeftContent = props => <Avatar.Icon {...props} color='#03dac4' backgroundColor='white' size={64} icon='id-card' />
  
    return (
      <View style={styles.container}>
        { loading && (
          <ActivityIndicator animating={true} color={Colors.green500} />
        )}
        { !loading && app.authenticated && (
        <Card style={{ elevation: 5, width: ScreenWidth - 40, borderRadius: 10, alignSelf: 'center' }}>
        <Card.Title title="Profile" titleStyle={{ color: '#6200ee', fontSize: 30, marginTop: 10, marginLeft: 20 }} left={LeftContent} />
        <Card.Content>
          <Text h5 style={styles.headerColor}>Business Name</Text>
          <Paragraph>{ app.profile.business }</Paragraph>
          <Text h5 style={styles.headerColor}>ABN</Text>
          <Paragraph>{ app.profile.abn }</Paragraph>
          <Text h5 style={styles.headerColor}>Address</Text>
          <Paragraph>{ app.profile.address }</Paragraph>
          <Text h5 style={styles.headerColor}>Suburb</Text>
          <Paragraph>{ app.profile.suburb }</Paragraph>
          <Text h5 style={styles.headerColor}>State</Text>
          <Paragraph>{ app.profile.state }</Paragraph>
          <Text h5 style={styles.headerColor}>Postcode</Text>
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

export default ProfileScreen
