import { useAnnounce, useDevice } from '../device/DeviceProvider'
import { Row, ScreenFrame } from './ScreenFrame'

export function CartListScreen() {
  const { state, available, activateCartList } = useDevice()
  useAnnounce('Cartridge list')
  const hint = state.cart.inserted ? 'A: play highlighted · Start: resume loaded · B: back' : 'A: play · B: back'
  return (
    <ScreenFrame title="Cartridges" right={`${available.length}`} hint={hint}>
      <ul className="flex flex-col gap-[0.5cqw]" aria-label="Cartridges">
        {available.map((c, i) => (
          <Row
            key={c.id}
            selected={i === state.listIndex}
            onClick={() => activateCartList(i)}
            right={state.cart.inserted === c.id ? 'IN SLOT' : c.bin === 'bargain' ? 'BIN' : c.status}
          >
            <span
              className="mr-[2cqw] inline-block h-[3.5cqw] w-[3.5cqw] border-2 border-current align-middle"
              style={{ background: c.label.bg }}
              aria-hidden="true"
            />
            {c.title}
          </Row>
        ))}
      </ul>
    </ScreenFrame>
  )
}
