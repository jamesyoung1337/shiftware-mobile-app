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

const ClientScreen = observer(({ navigation }) => {

    const app = useContext(ApplicationContext)
  
    const [clients, setClients] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [reload, setReload] = React.useState(1)
  
    const [visible, setVisible] = React.useState(false)
  
    const showModal = () => setVisible(true)
    const hideModal = () => setVisible(false)
  
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
      const color = item.id === selectedId ? '#fff' : '#000';
  
      return (
        <TouchableOpacity onPress={() => setSelectedId(item.id)}>
        <List.Item
          title={item.name}
          description={item.email}
          key={item.id}
          style={{ width: ScreenWidth, paddingLeft: 20, backgroundColor: backgroundColor }}
          titleStyle={{ color: color }}
          descriptionStyle={{ color: color }}
          left={props => <Avatar.Text label={getTitle(item.name)} size={42} style={{ alignSelf: 'center' }} />}
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

export default ClientScreen
