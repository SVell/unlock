import { useActor, useActorRef, useSelector } from '@xstate/react'
import { UnlockAccount } from '../UnlockAccount'
import {
  UnlockAccountService,
  unlockAccountMachine,
} from '../UnlockAccount/unlockAccountMachine'
import { ConnectService } from './connectMachine'

interface Props {
  connectService: ConnectService
  injectedProvider: unknown
}

export function UnlockAccountSignIn({
  connectService,
  injectedProvider,
}: Props) {
  const unlockAccountRef = useActorRef(unlockAccountMachine)
  const state = useSelector(unlockAccountRef, (state) => state)
  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService
  return (
    <UnlockAccount
      unlockAccountService={unlockAccountService}
      injectedProvider={injectedProvider}
    />
  )
}
