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

import { useFocusEffect, useIsFocused } from '@react-navigation/native'

import merge from 'deepmerge'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHome, faCalendarAlt, faUsers, faFileInvoiceDollar, faEnvelope, faLock, faSignInAlt,
faIdCard, faIdCardAlt, faIdBadge, faAt, faFont, faSave, faFileInvoice } from '@fortawesome/free-solid-svg-icons'

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

import RNPickerSelect from 'react-native-picker-select'


const InvoiceScreen = observer(({ navigation }) => {
    
  const app = useContext(ApplicationContext)
  
  const [clients, setClients] = React.useState([])
  const [invoices, setInvoices] = React.useState([])
  const [clientPickerValues, setClientPickerValues] = []

  const [loading, setLoading] = React.useState(true)
  const [reload, setReload] = React.useState(1)

  const [visible, setVisible] = React.useState(false)

  const [selectedClients, setSelectedClients] = React.useState([{}])
  const [selectedShifts, setSelectedShifts] = React.useState([{}])

  const showModal = () => setVisible(true)
  const hideModal = () => setVisible(false)

  const keyExtractor = (item, index) => index.toString()

  const loadData = async () => {
    // Does not always load everything, because this effect runs
    // once, but sometimes we have to force it.  We could use
    // the screen focus effect, and just touch the state to force
    // a re-render, and then stop loading everything when we
    // detect it's already loaded
    setClients([])

    let c
    
    try {
      c = await app.loadClients()
      setClients(c)
    }
    catch( err ) {
      console.log(`Error loading clients: ${JSON.stringify(err)}`)
    }

    let selectableClients = []
    c.map((cli, i) => {
      Object.defineProperty(cli, 'label', { writable: true, enumerable: true, value: cli.name })
      Object.defineProperty(cli, 'value', { writable: true, enumerable: true, value: cli.id })
      selectableClients.push(cli)

      // console.log(`Client: ${JSON.stringify(cli, null, 2)}`)
    })

    setSelectedClients(selectableClients)
    // console.log(selectedClients)
      
    setInvoices([])

    try {
      let inv = await app.loadInvoices()
      // console.log(inv)
      setInvoices(inv)
    }
    catch (error) {
        //
        console.log(`Error loading invoices: ${JSON.stringify(error)}`)
    }

    setLoading(false)
  }

  React.useEffect(() => {
    async function loadInvoiceData() {
      await loadData()
    }
    loadInvoiceData()
  }, [])

  const [selectedId, setSelectedId] = useState(null)

  const renderItem = ({ item }) => {

    const backgroundColor = '#03dac4'
    let color = '#03dac4'

    let paid_status = item.paid === null ? 'Unpaid' : 'Paid'
    let title = `Invoice #${item.id} ${paid_status}`

    if (paid_status === 'Unpaid') color = '#aa1100'

    let description = `Client: ${item.client.name} Email: ${item.client.email}\nShifts: ${item.shifts.length} Total: \$${item.total} GST: \$${item.gst}`

    return (
      <TouchableOpacity onPress={() => console.log(`Invoice select #${item.id}`)}>
      <List.Item
        title={title}
        description={description}
        key={item.id}
        style={{ width: ScreenWidth, paddingLeft: 20 }}
        titleStyle={{ color: color }}
        // descriptionStyle={{ color: color }}
        left={props => <FontAwesomeIcon icon={faFileInvoice} color='gray' size={42} style={{ alignSelf: 'center' }} />}
      />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.invoiceView}>
      {!loading && (
      <Portal>
        <Formik
          initialValues={{ shifts: [{}], due: '' }}
          onSubmit={async (values) => {
            // console.log(values)
            try {
              let result = await axios.post('https://shiftware.digital/api/v1/invoices',
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
          <Dialog.Title>Raise Invoice</Dialog.Title>
          <Dialog.Content>
              <View style={styles.form}>
                { !loading && selectedClients.length>0 && (
              <RNPickerSelect
                onValueChange={(value) => console.log(value)}
                items={selectedClients}
              /> )}
              </View>
          </Dialog.Content>
          <Dialog.Actions>
            <MaterialButton onPress={handleSubmit}>Save</MaterialButton>
          </Dialog.Actions>
          </Dialog>
          )}
          </Formik>
      </Portal> )}
      { loading && (
        <ActivityIndicator animating={true} color={Colors.green500} />
      )}
      { !loading && (
        <SafeAreaView style={styles.container}>
          <FlatList
            data={invoices}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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
  invoiceView: {
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

export default InvoiceScreen
