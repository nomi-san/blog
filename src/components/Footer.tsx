import { VoidComponent } from 'solid-js'

const Footer: VoidComponent = () => {
  return (
    <footer class='bg-[rgb(250,250,250)] mt-28'>
      <div class='py-12 text-center text-sm'>
        <p>
          Built with SolidJS
        </p>
        <p class='mt-2'>
          Copyright &copy; 2017-present Nguyen Duy
        </p>
      </div>
    </footer>
  )
}

export default Footer