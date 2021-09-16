import React from 'react'

import ApplicationState from '../State/ApplicationState'

// default app state context
const ApplicationContext = React.createContext(new ApplicationState())

const PreferencesContext = React.createContext({
    toggleTheme: () => {},
    isThemeDark: false,
})

export { ApplicationContext, PreferencesContext }

