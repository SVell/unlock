import React, { useCallback, useEffect, useMemo } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { checkoutMachine } from './checkoutMachine'
import { Select } from './Select'
import { Quantity } from './Quantity'
import { Metadata } from './Metadata'
import { Confirm } from './Confirm'
import { MessageToSign } from './MessageToSign'
import { Minting } from './Minting'
import { CardPayment } from './CardPayment'
import { useActor, useActorRef, useSelector } from '@xstate/react'
import { UnlockAccountSignIn } from './UnlockAccountSignIn'
import { Captcha } from './Captcha'
import { Returning } from './Returning'
import { Payment } from './Payment'
import { Password } from './Password'
import { Promo } from './Promo'
import { useAuth } from '~/contexts/AuthenticationContext'
import { isEqual } from 'lodash'
import { CheckoutHead, TopNavigation } from '../Shell'
import { PaywallConfigType } from '@unlock-protocol/core'
import { Guild } from './Guild'
import { Gitcoin } from './Gitcoin'
import { createActor } from 'xstate'
interface Props {
  injectedProvider: any
  paywallConfig: PaywallConfigType
  communication?: ReturnType<typeof useCheckoutCommunication>
  redirectURI?: URL
  handleClose?: (params: Record<string, string>) => void
}

export function Checkout({
  paywallConfig,
  injectedProvider,
  communication,
  redirectURI,
  handleClose,
}: Props) {
  console.log('Config')
  console.log(paywallConfig)

  const checkoutActor = createActor(checkoutMachine, {
    // @ts-ignore
    input: { paywallConfig },
  }).start()
  const state = useSelector(checkoutActor, (state) => state)
  const { account } = useAuth()

  const { mint, messageToSign } = state.context
  const matched = state.value.toString()
  const paywallConfigChanged = !isEqual(
    paywallConfig,
    state.context.paywallConfig
  )

  useEffect(() => {
    if (paywallConfigChanged) {
      checkoutActor.send({
        type: 'UPDATE_PAYWALL_CONFIG',
        config: paywallConfig,
      })
    }
  }, [paywallConfig, state, paywallConfigChanged])

  useEffect(() => {
    const user = account ? { address: account } : {}
    if (communication?.insideIframe) {
      communication.emitUserInfo(user)
    }
  }, [account, communication])

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      // Reset the Paywall State!
      checkoutActor.send({ type: 'RESET_CHECKOUT' })
      if (handleClose) {
        handleClose(params)
      } else if (redirectURI) {
        const redirect = new URL(redirectURI.toString())
        if (mint && mint?.status === 'ERROR') {
          redirect.searchParams.append('error', 'access-denied')
        }

        if (paywallConfig.messageToSign && !messageToSign) {
          redirect.searchParams.append('error', 'user did not sign message')
        }

        if (messageToSign) {
          redirect.searchParams.append('signature', messageToSign.signature)
          redirect.searchParams.append('address', messageToSign.address)
        }
        for (const [key, value] of Object.entries(params)) {
          redirect.searchParams.append(key, value)
        }
        return window.location.assign(redirect)
      } else if (!communication?.insideIframe) {
        window.history.back()
      } else {
        communication.emitCloseModal()
      }
    },
    [
      handleClose,
      communication,
      redirectURI,
      mint,
      messageToSign,
      paywallConfig.messageToSign,
      checkoutActor,
    ]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount
      ?.getSnapshot()
      .can('BACK')
    const canBack = state.can({ type: 'BACK' })
    if (canBackInUnlockAccountService) {
      return () => unlockAccount.send('BACK')
    }
    if (canBack) {
      return () => checkoutActor.send({ type: 'BACK' })
    }
    return undefined
  }, [state])

  const Content = useCallback(() => {
    switch (matched) {
      case 'SELECT': {
        return (
          <Select
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
            state={state}
          />
        )
      }
      case 'QUANTITY': {
        return (
          <Quantity
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'PAYMENT': {
        return (
          <Payment
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'CARD': {
        return (
          <CardPayment
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'METADATA': {
        return (
          <Metadata
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'CONFIRM': {
        return (
          <Confirm
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
            communication={communication}
          />
        )
      }
      case 'MESSAGE_TO_SIGN': {
        return (
          <MessageToSign
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
            communication={communication}
          />
        )
      }
      case 'MINTING': {
        return (
          <Minting
            onClose={onClose}
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
            communication={communication}
          />
        )
      }
      case 'UNLOCK_ACCOUNT': {
        return (
          <UnlockAccountSignIn
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'CAPTCHA': {
        return (
          <Captcha
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'GUILD': {
        return (
          <Guild
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'PASSWORD': {
        return (
          <Password
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }

      case 'PROMO': {
        return (
          <Promo
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'GITCOIN': {
        return (
          <Gitcoin
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      case 'RETURNING': {
        return (
          <Returning
            communication={communication}
            onClose={onClose}
            injectedProvider={injectedProvider}
            checkoutService={checkoutActor}
          />
        )
      }
      default: {
        return null
      }
    }
  }, [injectedProvider, onClose, checkoutActor, matched, communication])

  return (
    <div className="bg-white z-10  shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation
        onClose={!paywallConfig?.persistentCheckout ? onClose : undefined}
        onBack={onBack}
      />
      <CheckoutHead iconURL={paywallConfig.icon} title={paywallConfig.title} />
      <Content />
    </div>
  )
}
