import RegisterForm from '../components/Auth/RegisterForm'


export default function RegisterPage() {
  return (
    <div className="pageWrapper">
      <RegisterForm />

      <style jsx global>{`
        /* make the whole screen black & center the form */
        html, body, #__next {
          height: 100%;
          margin: 0;
        }
        .pageWrapper {
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      `}</style>
    </div>
  )
}
