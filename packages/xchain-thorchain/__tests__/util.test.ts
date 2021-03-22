import { AssetRune } from '../src/types'
import {
  getDenom,
  getDenomWithChain,
  getAsset,
  getTxsFromHistory,
  isBroadcastSuccess,
  isAssetRune,
  isSynthAsset,
} from '../src/util'
import { AssetBCH, baseAmount, THORChain } from '@xchainjs/xchain-util'
import { RawTxResponse, TxResponse } from '@xchainjs/xchain-cosmos/src/cosmos/types'
import { Msg } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import { StdTxFee } from 'cosmos-client/api'

describe('thorchain/util', () => {
  describe('isRuneAsset', () => {
    it('should return true for RuneAsset', () => {
      expect(isAssetRune(AssetRune)).toBeTruthy()
    })
    it('should return false for other assets', () => {
      expect(isAssetRune(AssetBCH)).toBeFalsy()
      expect(
        isAssetRune({
          chain: THORChain,
          symbol: 'ETH/ETH',
          ticker: 'ETH/ETH',
        }),
      ).toBeFalsy()
    })
  })

  describe('isSynthAsset', () => {
    it('should return true for SynthAsset', () => {
      expect(
        isSynthAsset({
          chain: THORChain,
          symbol: 'ETH/ETH',
          ticker: 'ETH/ETH',
        }),
      ).toBeTruthy()
    })
    it('should return false for other assets', () => {
      expect(isSynthAsset(AssetBCH)).toBeFalsy()
      expect(isSynthAsset(AssetRune)).toBeFalsy()
    })
  })

  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetRune', () => {
        expect(getDenom(AssetRune)).toEqual('rune')
      })
    })

    describe('getDenomWithChain', () => {
      it('get denom for AssetRune', () => {
        expect(getDenomWithChain(AssetRune)).toEqual('THOR.RUNE')
      })
    })

    describe('getAsset', () => {
      it('get asset for rune', () => {
        expect(getAsset('rune')).toEqual(AssetRune)
      })
    })
  })

  describe('transaction util', () => {
    describe('getTxsFromHistory', () => {
      const fee: StdTxFee = {
        gas: '200000',
        amount: [],
      }
      const from_address = 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly'
      const to_address = 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly'

      const txs: Array<TxResponse> = [
        {
          height: 0,
          txhash: '',
          data: '0A060A0473656E64',
          raw_log: '',
          gas_wanted: '200000',
          gas_used: '35000',
          tx: {
            msg: [
              MsgSend.fromJSON({
                from_address,
                to_address,
                amount: [
                  {
                    denom: 'rune',
                    amount: '1000',
                  },
                ],
              }),
              MsgSend.fromJSON({
                from_address,
                to_address,
                amount: [
                  {
                    denom: 'rune',
                    amount: '1000',
                  },
                ],
              }),
            ] as Msg[],
            fee: fee,
            signatures: null,
            memo: '',
          } as StdTx,
          timestamp: new Date().toString(),
        },
        {
          height: 0,
          txhash: '',
          data: '0A090A076465706F736974',
          raw_log: '',
          gas_wanted: '200000',
          gas_used: '35000',
          tx: {
            body: {
              messages: [
                MsgSend.fromJSON({
                  from_address,
                  to_address,
                  amount: [
                    {
                      denom: 'rune',
                      amount: '1000',
                    },
                  ],
                }),
                MsgSend.fromJSON({
                  from_address,
                  to_address,
                  amount: [
                    {
                      denom: 'rune',
                      amount: '1000',
                    },
                  ],
                }),
              ] as Msg[],
            },
          } as RawTxResponse,
          timestamp: new Date().toString(),
        },
      ]
      it('should parse transations', () => {
        const parsed_txs = getTxsFromHistory(txs, 'testnet')

        expect(parsed_txs.length).toEqual(2)

        expect(parsed_txs[0].asset).toEqual(AssetRune)
        expect(parsed_txs[0].from.length).toEqual(1)
        expect(parsed_txs[0].from[0].from).toEqual(from_address)
        expect(parsed_txs[0].from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
        expect(parsed_txs[0].to.length).toEqual(1)
        expect(parsed_txs[0].to[0].to).toEqual(to_address)
        expect(parsed_txs[0].to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()

        expect(parsed_txs[1].asset).toEqual(AssetRune)
        expect(parsed_txs[1].from.length).toEqual(1)
        expect(parsed_txs[1].from[0].from).toEqual(from_address)
        expect(parsed_txs[1].from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
        expect(parsed_txs[1].to.length).toEqual(1)
        expect(parsed_txs[1].to[0].to).toEqual(to_address)
        expect(parsed_txs[1].to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
      })
      describe('isBroadcastSuccess', () => {
        it('validates isBroadcastSuccess', () => {
          expect(isBroadcastSuccess({ logs: [] })).toBeTruthy()
        })
        it('invalidates isBroadcastSuccess', () => {
          expect(isBroadcastSuccess({})).toBeFalsy()
        })
      })
    })
  })
})
