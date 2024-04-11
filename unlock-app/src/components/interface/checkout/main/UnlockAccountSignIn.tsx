import { UnlockAccount } from '../UnlockAccount'
import { CheckoutService } from './checkoutMachine'
import {
  UnlockAccountService,
  unlockAccountMachine,
} from '../UnlockAccount/unlockAccountMachine'
import { Stepper } from '../Stepper'
import { Fragment } from 'react'
import { useActorRef, useSelector } from '@xstate/react'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function UnlockAccountSignIn({
  checkoutService,
  injectedProvider,
}: Props) {
  const unlockAccountRef = useActorRef(unlockAccountMachine)
  const state = useSelector(unlockAccountRef, (state) => state)
  const unlockAccountService = state.children
    .unlockAccount as UnlockAccountService

  return (
    <Fragment>
      <div className="mb-2">
        <Stepper service={unlockAccountService} />
      </div>
      <UnlockAccount
        unlockAccountService={unlockAccountService}
        injectedProvider={injectedProvider}
      />
    </Fragment>
  )
}
