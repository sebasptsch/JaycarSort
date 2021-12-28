export default ScanButton = ({ setSearchString }) => {
    if (!('BarcodeDetector' in window)) {
        return <></>
    } else {
        return <><button className="button is-link" onChange={(e) => handleButton} >Scan</button></>
    }

}

const handleButton = (e) => {
    const image = !e?.target?.files[0]
    const barcodeDetector = new BarcodeDetector()
    barcodeDetector.detect(image)
        .then(barcodes => {
            setSearchString(barcodes[0].rawData)
                ;
        })
        .catch(err => {
            console.log(err);
        })
}