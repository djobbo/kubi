import { useState } from "react"
import BarcodeScanner from "react-qr-barcode-scanner"

export const Scanner = () => {
  const [data, setData] = useState<string | null>(null)
  return (
    <>
      <BarcodeScanner
        width={500}
        height={500}
        onUpdate={(err, result) => {
          if (result) {
            setData(result.getText())
          }
        }}
      />
      {data && <p>{data}</p>}
    </>
  )
}
