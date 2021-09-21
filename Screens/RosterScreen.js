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

import { Agenda } from 'react-native-calendars'

import { ApplicationContext } from '../Context/Context'

import moment from 'moment'

const LeftContent = props => <Avatar.Icon {...props} color='#03dac4' backgroundColor='white' size={32} style={{ marginTop: 10 }} icon='id-card' />

const RosterScreen = observer(({ navigation }) => {
    const app = useContext(ApplicationContext)
    return (
      <Agenda
        // The list of items that have to be displayed in agenda. If you want to render item as empty date
        // the value of date key has to be an empty array []. If there exists no value for date key it is
        // considered that the date in question is not yet loaded
        items={app.shifts}
        // Callback that gets called when items for a certain month should be loaded (month became visible)
        loadItemsForMonth={(month) => {console.log('trigger items loading')}}
        // Callback that fires when the calendar is opened or closed
        onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
        // Callback that gets called on day press
        onDayPress={(day)=>{
          // console.log(day)
          // console.log(JSON.stringify(app.shifts, null, 2))
        }}
        // Callback that gets called when day changes while scrolling agenda list
        onDayChange={(day)=>{
          console.log('day changed')
          // setDay(day)
        }}
        // Initially selected day
        selected={moment().toDate().toUTCString()}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={12}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={12}
        // Specify how each item should be rendered in agenda
        // Item is an object, firstItemInDay is boolean - true or false
        renderItem={(item, firstItemInDay) => {
          // console.log(item)
          const shift_date = moment(item.shift_start).format('YYYY-MM-DD')
          const card_title = shift_date + ' ' + item.description
          return (
            <View style={styles.container}>
              <Card style={{ elevation: 5, width: ScreenWidth - 40, borderRadius: 10, alignSelf: 'center' }}>
              <Card.Title title={card_title} titleStyle={{ color: '#6200ee', fontSize: 16, marginTop: 10, marginLeft: 20 }} left={LeftContent} />
                <Card.Content>
                  <Paragraph>
                    Client: {item.client.name}
                  </Paragraph>
                  <Paragraph>
                  {item.formatted_start} - {item.formatted_end}
                  </Paragraph>
                </Card.Content>
              </Card>
            </View>
          )
        }}
        // Specify how each date should be rendered. day can be undefined if the item is not first in that day.
        renderDay={(day, item) => {return (<View />);}}
        // Specify how empty date content with no items should be rendered
        renderEmptyDate={() => {return (<View />);}}
        // Specify how agenda knob should look like
        renderKnob={() => {return (<View />);}}
        // Specify what should be rendered instead of ActivityIndicator
        renderEmptyData = {() => {return (<View />);}}
        // Specify your item comparison function for increased performance
        rowHasChanged={(r1, r2) => { return r1.client_id === r2.client_id }}
        // Hide knob button. Default = false
        hideKnob={false}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault={false}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
        onRefresh={() => console.log('refreshing...')}
        // Set this true while waiting for new data from a refresh
        refreshing={false}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
        refreshControl={null}
        // Agenda theme
        theme={{
            agendaDayTextColor: 'yellow',
            agendaDayNumColor: 'green',
            agendaTodayColor: 'red',
            agendaKnobColor: 'blue'
        }}
        // Agenda container style
        style={{}}
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

export { RosterScreen }
