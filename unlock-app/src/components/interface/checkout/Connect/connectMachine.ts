import { createMachine, InterpreterFrom } from 'xstate'
import { unlockAccountMachine } from '../UnlockAccount/unlockAccountMachine'

interface UnlockAccountEvent {
  type: 'UNLOCK_ACCOUNT'
}

interface DisconnectEvent {
  type: 'DISCONNECT'
}

interface BackEvent {
  type: 'BACK'
}

type ConnectMachineEvents = UnlockAccountEvent | BackEvent | DisconnectEvent

export const connectMachine = createMachine(
  {
    id: 'connect',
    /*
    tsTypes: {} as import('./connectMachine.typegen').Typegen0,
    schema: {
      events: {} as ConnectMachineEvents,
    },*/

    initial: 'CONNECT',
    states: {
      CONNECT: {
        on: {
          UNLOCK_ACCOUNT: {
            target: 'SIGN_IN',
          },
        },
      },
      SIGN_IN: {
        on: {
          BACK: 'CONNECT',
        },
        invoke: {
          id: 'unlockAccount',
          src: unlockAccountMachine,
          onDone: 'CONNECT',
        },
      },
    },
  },
  {}
)
