const express=require("express");
const app=express();
const path=require("path");
const fs=require('fs');
const sharp=require('sharp');

app.set("view engine","ejs");

app.use("/resurse", express.static(path.join(__dirname, "resurse")));// cai absolute


// app.use("/resurse",express.static(__dirname+"\\resurse")); pentru a incarca resurse in mod relativ
// app.use("/ceva",function(req,res,next){
//     console.log("aici");
//     next(); trece la urmatorul get
// })

app.get(['/', '/index', '/home'],function(req,res){
    res.render("pagini/index",{ip:req.ip, imagini:obGlobal.obImagini.imagini});
    
})
app.get("/despre_noi",function(req,res){
    res.render("pagini/despre_noi")
   });

obGlobal={
    erori:[],
    obImagini:[]
}
function initErori(){
    let continut=fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let obJson=JSON.parse(continut)

    //for (let i=0; i<obJson.info_erori; i++){ obJson.info_erori[i] ...}
    for(let eroare of obJson.info_erori){
        eroare.imagine=obJson.cale_baza+eroare.imagine;
    }
    obGlobal.erori=obJson
    
    obJson.eroare_default.imagine=obJson.cale_baza+obJson.eroare_default.imagine;
}

initErori()

function afisEroare(res, _indentificator = -1, _titlu, _text, _imagine) {
    let vErori = obGlobal.erori.info_erori;
  
    let eroare = vErori.find(function (el) {
      return el.identificator == _indentificator;
    });
    if (eroare) {
      let titlu1 = _titlu || eroare.titlu;
      let text1 = _text || eroare.text;
      let imagine1 = _imagine || eroare.imagine;
      if (eroare.status) {
        res.status(_indentificator).render("pagini/eroare", {
          titlu: titlu1,
          text: text1,
          imagine: imagine1,
        });
      } else {
        res.render("pagini/eroare", {
          titlu: titlu1,
          text: text1,
          imagine: imagine1,
        });
      }
    }   else{
        let errDefault=obGlobal.erori.eroare_default
        let titlu1= _titlu || errDefault.titlu;
        let text1= _text || errDefault.text;
        let imagine1= _imagine || errDefault.imagine;
        res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1})

    
    }
  }
  
 
  app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/ico/favicon/favicon.ico"))
})

app.get('/*', function(req, res) {
    res.render("pagini" + req.url, function(err, rezultatRandare) {
        if(req.url.match(/^\/resurse(\/[a-zA-Z0-9]*)*\/?$/g)){
            afisEroare(res,403);
        } 
        else if(
            req.url.match("/*.ejs")){
                afisEroare(res, 400);
         }
        else if (err) {
            if (err.message.startsWith('Failed to lookup view')) {
                afisEroare(res, 404);
            } 
            else{
                afisEroare(res);
            }
            
        } 
    
        else {
            res.send(rezultatRandare);
        }
    });
});
vectFoldere=["temp", "temp1", "backup", "poze_uploadate"];
for (let folder of vectFoldere){
    let cale=path.join(__dirname, folder);
    if (!fs.existsSync(cale)){
        fs.mkdirSync(cale);
    }
}

function initImagini(){
    var continut= fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.cale.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300,200).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(200,100).toFile(caleFisMicAbs);
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale )
        //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
initImagini();
// app.get("/ceva",function(req,res){
//     res.send("altceva")
// })
// app.get("/*",function(req,res){
//     res.send("altceva")
//    console.log("cerere generala:" ,req.url)
// }) //daca cere resurse ce nu existe for fi afisate.
app.listen(8080,function(){
    console.log("Directorul curent ",__dirname, "\nFolderul curent:",process.cwd(),"\nFisierul curent",__filename);
})