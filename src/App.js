import React from "react";
import $ from "jquery";
import "./App.css";

class Cell extends React.Component{
  state = {
    cssClass: 'dead',
    isAlive: true
  };

  changeClass = () =>{
    this.setState({cssClass: this.state.cssClass === 'dead' ? 'alive' : 'dead'})
  };

  changeDead = () =>{
      this.setState({isAlive: !this.state.isAlive});
      this.changeClass();
  };

  render(){
    const {
      cssClass,
      isAlive
    }= this.state;

    const {
        reference
    }= this.props;

    return(
        <div className={`wrapper`} >
          <i className={`material-icons cell ${cssClass}`}
             value={isAlive}
             onClick={this.changeDead}
             id={reference}
          >
              flare
          </i>
        </div>
    )
  }
}

export default class App extends React.Component {
    state = {
        cellsAlive:[],
        playedGames: 0,
        interval: null,
        goingToDie: [],
        goingToBeBorn: [],
        posibleMitosis: []
    };

    renderCube = () =>{
        const cube = [];

        for (let i = 0; i < 200; i++){
          cube.push(i);
        }

        return cube.map((cell)=>{
          return(
            <Cell key={cell} reference={cell}/>
          )
        })
    };

    changeCellsAlive = (cells) =>{
        // this.setState(oldState => ({ cellsAlive: cells }));
        this.setState({ cellsAlive: cells });
    };

    changePlay = (number) =>{
        // this.setState(oldState => ({ playedGames: number }));
        this.setState({ playedGames: number });
    };

    setTimer = (cicler) =>{
        // this.setState(oldState => ({ interval: cicler }));
        this.setState({ interval: cicler });
    };

    changeDeatNote = (cell) => {
        const list = this.state.goingToDie.splice(0);
        list.push(cell);
        // this.setState(oldState => ({goingToDie:list}));
        this.setState({goingToDie:list});
    };

    deatNote = (cellHearbeat, cell) =>{
        if (cellHearbeat < 2 || cellHearbeat > 3){
            this.changeDeatNote(cell);
        }
    };

    changeDeliveryList = (cell) => {
        const list = this.state.goingToBeBorn.splice(0);
        list.push(cell);
        this.setState(oldState => ({goingToBeBorn:list}));
    };

    mitosis = (cellHearbeat, cell) =>{
        if (cellHearbeat === 3){
            this.changeDeliveryList(cell);
        }
    };

    changePosibleMitosis = (cell) => {
        const list = this.state.posibleMitosis.splice(0);
        list.push(cell);
        this.setState(oldState => ({posibleMitosis:list}));
    };

    lookingForMitosis = (array, cell) =>{
        array.forEach((index)=>{
            const sum = index + parseInt(cell);
            if($(`#${sum}`).attr("value") === "true"
                && sum >= 0
                && sum < 200
                && ! this.state.posibleMitosis.includes(sum)
            ){
                this.changePosibleMitosis(sum);
            }
        });
    };

    autoClick = (index) =>{
        $(`#${index}`).click();
    };

    jugdment = (cell) =>{
        const leftSide = ["0","20","40","60","80","100","120","140","160","180"];
        const rightSide = ["19","39","59","79","99","119","139","159","179","199"];

        const right = [19,20,-1,-20,-21];

        const left = [1,20,21,-19,-20];

        const middle = [1,19,20,21,-1,-19,-20,-21];

        if(leftSide.includes(cell)){
            this.deatNote(this.heartRate(left, cell), cell);
            this.lookingForMitosis(left, cell);
        }else if(rightSide.includes(cell)){
            this.deatNote(this.heartRate(right, cell), cell);
            this.lookingForMitosis(right, cell);
        }else{
            this.deatNote(this.heartRate(middle, cell), cell);
            this.lookingForMitosis(middle, cell);
        }
    };

    heartRate = (array, cell) =>{
      let beats = 0;
      array.forEach((index)=>{
          const sum = index + parseInt(cell);
          if($(`#${sum}`).attr("value") === "false" && sum >= 0 && sum < 200){
              beats++;
          }
      });
      return beats;
    };

    howManyAlive = () =>{
        const cellsAlive = $('i[value=false]').get().map(cell=>{
            return cell.id
        });

        if (cellsAlive.length > 0){
            this.changeCellsAlive(cellsAlive);
            this.state.cellsAlive.forEach((cell)=>{
               this.jugdment(cell)
            });
        }
    };

    play = (time) =>{
        let timer = this.state.playedGames;
        const start = setInterval(()=>{
            this.howManyAlive();
            timer++;
            this.changePlay(timer);
            this.timeToDie();
            this.timeToBorn();
        }, time);

        return start;
    };

    timeToDie = () =>{
        const list = this.state.goingToDie.splice(0);
        list.forEach((cell)=>{
            this.autoClick(cell)
        });
    };

    timeToBorn = () =>{
        this.state.posibleMitosis.forEach((cell)=>{
            this.birth(cell);
        });

        const list = this.state.goingToBeBorn.splice(0);
        list.forEach((cell)=>{
            this.autoClick(cell)
        });
    };

    birth = (cell) => {
        const leftSide = [0,20,40,60,80,100,120,140,160,180];
        const rightSide = [19,39,59,79,99,119,139,159,179,199];
        const right = [19,20,-1,-20,-21];
        const left = [1,20,21,-19,-20];
        const middle = [1,19,20,21,-1,-19,-20,-21];

        if(leftSide.includes(cell)){
            this.mitosis(this.heartRate(left, cell), cell);
        }else if(rightSide.includes(cell)){
            this.mitosis(this.heartRate(right, cell), cell);
        }else{
            this.mitosis(this.heartRate(middle, cell), cell);
        }
    };

    armageddon = () =>{
        const list = this.state.cellsAlive.splice(0);
        list.forEach((cell)=>{
           this.autoClick(cell)
        });
    };

    pauseGame = () =>{
        clearInterval(this.state.interval);
    };

    resumeGame = () =>{
        this.setTimer(this.play(2000));
    };

    initGame = () =>{
        const list = [];
        for (let i = 0; i <= 40; i++) {
            list.push(Math.floor((Math.random() * 199)))
        }
        list.forEach((i)=>{
           this.autoClick(i)
        });
        this.play(2000)
    };

    componentDidMount(){
        this.initGame();
    }

    render(){
        return (
            <div className="App">
                <nav>
                  <div className="nav-wrapper green lighten-1">
                      <a className="brand-logo center ">The Game Of Life FCC</a>
                  </div>
                </nav>
                <div className="container grid">
                    {this.renderCube()}
                </div>
                <div className="container">
                    <div className="card brown darken-2">
                        <div className="card-title white-text">
                            <span>Controls</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s3">
                            <a className="counter btn-large brown waves-effect" onClick={this.armageddon}>Clear</a>
                        </div>
                        <div className="col s3">
                            <a className="counter btn-large brown waves-effect" onClick={this.pauseGame}>Pause</a>
                        </div>
                        <div className="col s3">
                            <a className="counter btn-large brown waves-effect" onClick={this.resumeGame}>Play</a>
                        </div>
                        <div className="col s3">
                            <a className="counter btn-large green lighten-1 waves-effect">{this.state.playedGames}</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
