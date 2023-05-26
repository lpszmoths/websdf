export interface CustomRadioProps
extends Omit<HTMLInputElement, 'children'> {
  children: React.ReactNode
}

export default function CustomRadio(
  {
    name,
    value,
    checked,
    children,
  }: CustomRadioProps
) {
  return (
    <div className='radio-container'>
      <label className='columns'>
        <div className='fit-content'>
          <input
            type='radio'
            name={name}
            value={value}
            checked={checked}
          />
          <span className='radio-proxy'></span>
        </div>
        <div>
          {children}
        </div>
      </label>
    </div>
  )
}