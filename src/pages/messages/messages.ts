import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../../providers/auth/auth';
import { NavigatePage } from '../navigate/navigate';
/**
 * Generated class for the MessagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  private User;
  private connections:any;
  private amount:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public authData: AuthProvider, private afAuth: AngularFireAuth) {
  }

  ionViewDidLoad() {
    //laad alle messages
    this.connections=[];
    let teller=0;
    
    this.afAuth.authState.subscribe( user => {
      
      if (user) {
        this.User=user;
        const Connections: firebase.database.Reference = firebase.database().ref(`/Connection/`+user.uid);
        Connections.on('value', snapshot=> {
          this.connections=[];
          teller=0;
          this.amount=0;
          snapshot.forEach((element)=>{
            const Names: firebase.database.Reference = firebase.database().ref(`/User/`+element.val().uid);
            Names.on('value', snapshott=> {
              this.connections[teller]=snapshott.val().user_name;
              teller++;
              this.amount=teller; 
            });
            
            return false;
          });
          
        });
        
      }
    });
  }

  remove(link){
    //laat alert zien met de vraag om een gekozen bericht te verwijderen
    let alert = this.alertCtrl.create({
      title: 'Warning',
      subTitle: 'are you sure you want to remove '+link+' ',
      buttons: [{ 
                  text:'No',
                  role: 'cancel',
                  handler: () => {
                }},
                { text:'Yes',
                  handler: () => {
                    this.removeYes(link);
                }}
                ]
    });
    alert.present();
  }

  removeYes(link){
    //verwijder message
    this.afAuth.authState.subscribe( user => {
      if (user) {
        this.User=user;
        const Connections: firebase.database.Reference = firebase.database().ref(`/User`);
        Connections.once('value', snapshot=> {
          snapshot.forEach((element)=>{
            
            if(element.val().user_name==link){
              const idToRemove: firebase.database.Reference=firebase.database().ref('/Connection/'+user.uid);
              idToRemove.once('value',data=>{
                data.forEach((dat)=>{
                  if(dat.val().uid==element.key){
                    const recordToRemove: firebase.database.Reference=firebase.database().ref('/Connection/'+user.uid+'/'+dat.key);
                    recordToRemove.remove();
                    return true;
                  }
                  return false;
                })
              });
              return true;
            }
            return false;
          });
        });
        
      }
      this.connections=[];
      this.navCtrl.setRoot(MessagesPage);
      
    });
  }
  showRoute(connectTo){
    //laat navigatie naar contact zien
    this.navCtrl.push(NavigatePage,{param1:connectTo});
  }

}
