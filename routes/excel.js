const xlsx = require('xlsx')
const path = require('path')
const convertToExcel =(attendance,date,month,year,serviceType)=>{
    const workSheet =xlsx.utils.json_to_sheet(attendance)
    const workBook = xlsx.utils.book_new()

    xlsx.utils.book_append_sheet(workBook,workSheet,'totalAttendance')
    xlsx.write(workBook,{bookType:'xlsx',type:"buffer"})
    xlsx.write(workBook,{bookType:'xlsx',type:'binary'})
    var down =path.join( __dirname,`attendance ${serviceType} (${date}-${month}-${year}).xlsx` )
    xlsx.writeFile(workBook,down)
    
   }

   module.exports= convertToExcel