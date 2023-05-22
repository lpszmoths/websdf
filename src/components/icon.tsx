import imgUploadIcon from '../icons/icon-img-upload.svg'

const ICONS = {
  imgUpload: imgUploadIcon
}

export interface IconProps {
  icon: keyof typeof ICONS
}

export default function Icon({
  icon
}: IconProps) {
  return (
    <span className='icon'>
    </span>
  )
}
