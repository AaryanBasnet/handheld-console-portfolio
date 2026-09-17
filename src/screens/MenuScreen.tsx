import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { menuItems } from '../device/deviceReducer'
import { cartById } from '../content/cartridges'
import { Row, ScreenFrame } from './ScreenFrame'

export function MenuScreen() {
  const { state, activateMenu } = useDevice()
  const inserted = cartById(state.cart.inserted ?? undefined)
  const items = menuItems(state, inserted?.title ?? null)
  useAnnounce('Main menu')
  const hint = inserted ? 'A: select · Start: play · B: back' : 'A: select · Start: cartridges · B: back'
  return (
    <ScreenFrame title="Menu" right={inserted ? `SLOT: ${inserted.title}` : 'SLOT: EMPTY'} hint={hint}>
      <ul className="flex flex-col gap-[0.5cqw]" aria-label="Main menu">
        {items.map((item, i) => (
          <Row key={item.id} selected={i === state.menuIndex} onClick={() => activateMenu(i)} sub={item.sub}>
            {item.label}
          </Row>
        ))}
      </ul>
    </ScreenFrame>
  )
}
