import React, { createContext, useCallback, useEffect, useState } from 'react'
import { getConnectionStatus, onConnectObservable, UserInfo } from '../../services/bridge-service'
import getUserInfo from '../getUserInfo'
import isLocalDev from '../../utils/isLocalDev'

type Auth = {
  user?: UserInfo
  ready: boolean
}

const defaultValue: Auth = {
  user: undefined,
  ready: false,
}

export const AuthContext = createContext(defaultValue)

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>()
  const [ready, setReady] = useState(false)

  const fetchUserInfo = useCallback(() => {
    getUserInfo()
      .then((userInfo) => {
        if (!userInfo.error) {
          setUser(userInfo)
        }
        setReady(true)
      })
      .catch(() => {
        setReady(true)
      })
  }, [])

  // Fetch user info
  useEffect(() => {
    const onConnectHandler = () => {
      onConnectObservable.unsubscribe(onConnectHandler)
      fetchUserInfo()
    }

    // If it's connected already, just get the info
    if (getConnectionStatus() === 'connected') {
      fetchUserInfo()
    }

    // DEV - calls anyways if it's localhost
    if (isLocalDev) {
      fetchUserInfo()
    }

    onConnectObservable.subscribe(onConnectHandler)
    return () => {
      onConnectObservable.unsubscribe(onConnectHandler)
    }
  }, [fetchUserInfo])

  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>
}

export default AuthProvider
