import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [data, setData] = useState<any>()

  useEffect(() => {
    const f = async () => {
      try {
        const res = await fetch('/backend/test')
        setData(await res.json())
      } catch (error) {
        setData(error)
      }
    }
    f()
  }, [])
  return (
    <div className={styles.container}>
      <h1>response from backend</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  )
}

export default Home
