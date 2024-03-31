
function startProgram(){

  /*
   kierunki silnikow, jezeli kreca sie w prawo to zmienna ma wartosc 1,
  jezeli w lewo to -1. Zmiana nastepuje po nascisnieciu odpowiedniego klawiasza
  */ 
  let cs_0_direction = 1; 
  let cs_1_direction = 1;
  let cs_2_direction = 1;
  
  // zmienna odpowiedzialna za przyciski
  let bt = '';

  // tablica  odpowiedzilana za przetrzymywanie topicow publukujacyh dane
  let publischers = [];

  // zmienna w ktorej bedzie obiekt zarzadzajacy polaczeniem
  let ros = '';

  // tablica odpowiedzialna za preztrzymywanie wszystkich topicow
  let listners = [];

  // zmienna odpowiedzialna za przetrzymywanie obiektu serwisu
  let getJointsLength = '';

  // pusty request do serwisu
  let request = new ROSLIB.ServiceRequest({});
  
  // zmienie odpowiedzialne za moc silnika
  let value_of_power_motor0 = 0;
  let value_of_power_motor1 = 0;
  let value_of_power_motor2 = 0;

  // pozycja pocatkowa 3 kol reprezantujacyh 3 silniki
  let positions = [{x:250, y:250}, {x:250, y:350}, {x:250,y:450}];

  // zmienna odpowiedzialna za reset pozycji animacji 3 silnikow zaleznych so siebie
  let reset_position = false;

  // pobranie elementow wszystkich suwakow
  const sliders = document.querySelectorAll('.Sliders');

  //tablica z katami uzyta do animacji 3 silnikow, zaleznych od siebie
  let deg = [];

  // obiekt do publikacji danych, publikowany z programu do silnikow
  var mes = new ROSLIB.Message({
    data: 0
})
  

// pobranie elementu do wyswietlania wartosci suwaka dla silnikow
const power_regulation_motor0_value = document.getElementById('sliderValue');
const power_regulation_motor1_value = document.getElementById('sliderValue2');
const power_regulation_motor2_value = document.getElementById('sliderValue3');

// tworzenie funkcji ktora stworzy tablice katow dla 3 silnikow, i zainicjalizowaniem jej 3 wartosciami PI
function createAngles(){
  let tables_of_angles = [];
  for(let i=0; i<3;i++)
  {
    let x = Math.PI;
    tables_of_angles.push(x);
  }
  return tables_of_angles;
}

// tworzenie tablici katow ktora posluzy nam do aktualizacji pozycji silnikow
let angles = createAngles();

// Funkcja odpowaidajaca za nawiazanie polaczenia
function connect(){
  let ros_object = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
  });

  ros_object.on('connection', function() {
    document.getElementById("status_button").innerHTML = "Connected";
  });

  ros_object.on('error', function(error) {
    document.getElementById("status_button").innerHTML = "Error";
  });

  ros_object.on('close', function() {
    document.getElementById("status_button").innerHTML = "Closed";
  });

  return ros_object
}
 
// funkcja realizujaca stworzenie 3 nasluchujaych topicow
function createListners(){
  let motors_listners_table = [];
  
  for(let i=0; i<3;i++){
    let motor_listener = new ROSLIB.Topic({
      ros : ros,
      name : `/virtual_dc_motor_node/get_position_${i}`,
      messageType : 'std_msgs/UInt16'
    });

    motors_listners_table.push(motor_listener)

  }

  return motors_listners_table;
  
}
  
// funkcja wyswietlajaca pozycje, polozenia ramienia silnika dla kazdego silnika po koleji
  function displayValue(position,motor){

     
      let x = 0;
      switch(motor)
      {
        case 1:
          // pobierz pozycje silnika
          x = position.data;
          //oblicz pozycje w kacie
          angles[0] = ((x * 0.0879)* Math.PI)/180;
          //wyswietl ja
          document.getElementById("position_0").innerHTML = String(((angles[0]*180)/Math.PI).toFixed(2));
          break;

        case 2:
          x = position.data;
          angles[1] = ((x * 0.0879)* Math.PI)/180;
          document.getElementById("position_1").innerHTML = String(((angles[1]*180)/Math.PI).toFixed(2));
          break;

        case 3:
          x = position.data;
          angles[2] = ((x * 0.0879)* Math.PI)/180;
          document.getElementById("position_2").innerHTML = String(((angles[2]*180)/Math.PI).toFixed(2));
          break;
        default:
          console.log('Nie ma takiego silnik');

      }
      // za kazdym razem gdy odswieazamy wartosci pozycji to tez odswiezamy wartosc dlugosci
      getJointsLength.callService(request, (result) => 
      {
        updateLength(result);
      })
      
  }

// funkcja odpowiadaja za wywolanie serwisu, oraz zwrocenie jego obiektu
function GetSeriveJointsLength(){
  let getService = new ROSLIB.Service({
    ros : ros,
    name : '/virtual_dc_motor_node/get_joints_length',
    type : 'virtual_dc_motor/getMotorJointsLengths',
  
  });

  return getService;
  
}

// funkcja odpowiedzialna za tworzenie nodow publikujacych dane
function createPublischers(){
  let motor_publischers_table = [];
  for(let i=0; i<3;i++)
  {
    let publischer = new ROSLIB.Topic({
      ros : ros,
      name : `/virtual_dc_motor_node/set_cs_${i}`,
      messageType : 'std_msgs/Int8'
    });
    motor_publischers_table.push(publischer);
  }

  return motor_publischers_table;
  
}
   

  
  

  // funkcja do aktualizacji wartosci suwaka
  function updateValue(sliderId){
    
    // wa zaleznosi jaki suwak przesuwamy, to bedziemy adekwatne pole zmieniac pod danym suwakiem
    switch(sliderId){

      case 'mySlider':
        value_of_power_motor0 = Number(document.getElementById(sliderId).value) * cs_0_direction;
        mes.data = Number(value_of_power_motor0);
        publischers[0].publish(mes);
        power_regulation_motor0_value.innerHTML = value_of_power_motor0;
        break;

      case 'mySlider2':
        value_of_power_motor1 = Number(document.getElementById(sliderId).value) * cs_1_direction;
        mes.data = Number(value_of_power_motor1);
        publischers[1].publish(mes);
        power_regulation_motor1_value.innerHTML = value_of_power_motor1;
        break;

      case 'mySlider3':
        value_of_power_motor2 = Number(document.getElementById(sliderId).value) * cs_2_direction;
        mes.data = Number(value_of_power_motor2);
        publischers[2].publish(mes);
        power_regulation_motor2_value.innerHTML = value_of_power_motor2;
        break;
      // za kazdym razem gdy albo resetujesmy animacje 3 silnikow lub nawiazujemy nowe polaczenie zresetuj wszystko
      case 'startProgram':
        
        power_regulation_motor0_value.innerHTML = 0;
        power_regulation_motor1_value.innerHTML = 0;
        power_regulation_motor2_value.innerHTML = 0;

        mySlider.value = 0;
        mySlider2.value = 0;
        mySlider3.value = 0;
        

        mes.data = Number(0);
        publischers[0].publish(mes);
        mes.data = Number(0);
        publischers[1].publish(mes);
        mes.data = Number(0);
        publischers[2].publish(mes);
       
        break;
    
      default:
        console.log('UpdateValue Case, nie zostal podany nie podany parametr');
        break;
    }
     
  }

  // funkcja resetujaca kolory przyciskow za kazdym razem gdy nacisniemy klawisz
  function resetButtonsColors(){
    document.getElementById('button_L').style.color = "black";
    document.getElementById('button_R').style.color = "black";
    document.getElementById('button_F').style.color = "black";
    document.getElementById('button_B').style.color = "black";
    document.getElementById('button_G').style.color = "black";
    document.getElementById('button_H').style.color = "black";
  }

  // funckja obslugujaca zmiane koloru przycisku
  // kolor przycisku zmienia sie w zaleznosci od wcisniecia
  // przycisku na klawiwaturze
  function changeButtonColor(bt){
    //console.log(bt)
    // zanim zmienisz kolor przycisku zresetuj ich kolor
    resetButtonsColors();
    switch (bt){
      case 'button_L':
        document.getElementById('button_L').style.color = "red";
        break;
      case 'button_R':
        document.getElementById('button_R').style.color = "red";
        break;
      case 'button_F':
        document.getElementById('button_F').style.color = "red";
        break;
      case 'button_B':
        document.getElementById('button_B').style.color = "red";
        break;
      case 'button_H':
        document.getElementById('button_H').style.color = "red";
        break;
      case 'button_G':
        document.getElementById('button_G').style.color = "red";
        break;

      default:
        console.log('Ten przycisk nie istnieje, wiec nie mozna zmienic koloru')
        break;
      
    }
     return;

    
  }
     
   // zmiana kierunku w zaleznosci od kliknietego przycisku
  function changeDirection(code){
   
    switch (code){
    
    
        case 'KeyL':
            cs_0_direction = -1;
            changeButtonColor('button_L');
            updateValue('mySlider');
            break;

        case 'KeyR':
            cs_0_direction = 1;
            changeButtonColor('button_R');
            updateValue('mySlider');
            break;

        case 'KeyB':
            cs_1_direction = -1;
            changeButtonColor('button_B');
            updateValue('mySlider2');
            break;

        case 'KeyF':
            cs_1_direction = 1;
            changeButtonColor('button_B');
            updateValue('mySlider2');
            break;

         case 'KeyG':
            cs_2_direction = -1;
            // zmien kolor przycisku
            changeButtonColor('button_G');
            /* 
            Zaktulizuj wartos suwaka zeby od razu po kilnieciu przycisku pojawila sie pod nim wartosc ze zmienionym znakiem.
            Inaczej trzeba by bylo przsunac suwak zeby pojawila sie wartosc ze zmienionym znakiem, zaleznym od przyjetego.
            */
            updateValue('mySlider3');
            break;

        case 'KeyH':
            cs_2_direction = 1;
            changeButtonColor('button_H');
            updateValue('mySlider3');
            break;

        default:
            console.log('Nieznany Przycisk');
    }

  }
 

  //animacja motor1
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  //animacja motor2
  const canvas2 = document.getElementById("myCanvas2");
  const ctx2 = canvas2.getContext("2d");
   
  //animacja motor3
  const canvas3 = document.getElementById("myCanvas3");
  const ctx3 = canvas3.getContext("2d");

  //animacja 3 motorow zleznych od siebie
  const realational_motor_visualization_canvas = document.getElementById("realational_motor_visualization");
  const realational_motor_visualization_ctx = realational_motor_visualization_canvas.getContext("2d");

  const canvasTable = [canvas,canvas2,canvas3,realational_motor_visualization_canvas];
  const ctxTable = [ctx,ctx2,ctx3,realational_motor_visualization_ctx];

  // Narysuj silnik 
  function drawCircle(x,y,r,context){
   
    context.beginPath();
    context.arc(x,y,r,0,2 * Math.PI);
    context.fillStyle = 'blue';
    context.fill();
    
  }
  
 // funkcja realizuja rysowanie ramienia silnika
  function drawLine(s1,s2,ctx,angle){
    
    // punkt startowy lini
    const x1 = s1 + 50* Math.cos(angle);
    const y1 = s2 + 50 * Math.sin(angle);

    // punkt koncowy lini
    const x2 = s1 + 100 * Math.cos(angle); // tutaj daj dane z tablicy 
    const y2 = s2 + 100 * Math.sin(angle);
 
    // rysowanie lini
    ctx.beginPath();  
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();

  }
 
 // funkcja odpowiadajaca za animacje silnika
  function animate(){

   //obsluga 3 animacji silnikow
    for(let i = 0; i < 3; i++)
    {
    ctxTable[i].clearRect(0,0 ,canvasTable[i].width,canvasTable[i].height);
    drawCircle(130,130,50,ctxTable[i],angles[i]);
    drawLine(130,130,ctxTable[i],angles[i]);   
    }
    // obsuga animacji 3 silnikow zaleznych od siebie
    
    realational_motor_visualization_ctx.clearRect(0,0 ,realational_motor_visualization_canvas.width,realational_motor_visualization_canvas.height);
    if(!reset_position)
    {
      deg = angles;
    }
    
    for(let i=0; i<3;i++)
    { 
      let x,y;
      // pierwsze kolo, ktore jest statyczne
      if(i === 0)
      {
        x = positions[i].x;
        y = positions[i].y;
      }else{
        // pobierz srodek poprzedniego kola
        const prevX = positions[i-1].x;
        const prevY = positions[i-1].y;

        // dodaj do tego jakas dlugosc 
        x = prevX + Math.cos(deg[i]) * 100;
        y = prevY + Math.sin(deg[i])* 100;
      
        // aktualizacja o aktualna pozycje
        positions[i].x = x;
        positions[i].y = y;

        // narysuj ramie silnika, rysowanie jednak raienia tutaj zostawiam, z powodu wiekszej przejrzystosci.
        realational_motor_visualization_ctx.beginPath();  
        realational_motor_visualization_ctx.moveTo(prevX,prevY);
        realational_motor_visualization_ctx.lineTo(x,y);
        realational_motor_visualization_ctx.stroke();
      }
      
      drawCircle(positions[i].x,positions[i].y,25,realational_motor_visualization_ctx);
    }
   
    requestAnimationFrame(animate);
   
  }


document.addEventListener('click',(event) => {
  if(event.target.id === 'status_button' && document.getElementById("status_button").innerHTML === 'Closed')
  {
     ros = connect();
     // stworz mozliwosc publikacji danych do silnikow dane do silnkow
     publischers = createPublischers('StartPosition');
     listners = createListners();

      // wywolaj serwis
      getJointsLength = GetSeriveJointsLength();
  
    // Pobieraj dane o pozycji silnikow
      listners[0].subscribe((position_0) => {displayValue(position_0,1)});
      listners[1].subscribe((position_1) => {displayValue(position_1,2)});
      listners[2].subscribe((position_2) => {displayValue(position_2,3)});
    
      
    
    

     // stworz animacje
     animate();
     
     updateValue('startProgram');
   
  } else if (event.target.id === 'status_button' && document.getElementById("status_button").innerHTML === 'Connected')
  {
    // zamknij polaczenie
    ros.close();
    document.getElementById("status_button").innerHTML === 'Closed';


  } else if(event.target.id === 'position_button' && document.getElementById("position_button").innerHTML == 'Stop'){
    /* Ten blok wykonuje logike resetu animacji 3 slinkow,
    ktora polega na wyprostowaniu konstrukcji. Najpierw wylaczamy 'Power', 
    dla kazdego silnika ustwiajac go na zero. 
     */

    updateValue('startProgram');
    deg =[0,0,0];
    reset_position = true;
    document.getElementById("position_button").innerHTML = 'GO';


  }else if(event.target.id === 'position_button' && document.getElementById("position_button").innerHTML === 'GO'){
   
    reset_position = false;
    document.getElementById("position_button").innerHTML = 'Stop';


  }
})
 
// daj dane z serwisu na strone
function updateLength(result){
  document.getElementById('joints_length0').innerHTML = String(result.data[0]);
  document.getElementById('joints_length1').innerHTML = String(result.data[1]);
  document.getElementById('joints_length2').innerHTML = String(result.data[2]);

}

 
    
 // nasluchuj dane z kazdego suwaka
  sliders.forEach(slider => {
    slider.addEventListener('input',(event)=> updateValue(event.target.id));
    });
  
    
    
     // nasluchujemy jaki przycisk zostal nacisniety
    document.addEventListener('keydown', (event) => changeDirection(event.code));
  
   
 
}
 
 

  
// rozpocznij program
startProgram();
  



  




