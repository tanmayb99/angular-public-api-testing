import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import {ValidatorService} from 'projects/angular-iban/src/public-api';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {

  form: FormGroup;
  ibanGermany = 'DE12500105170648489890';
  details:any={};
  ibanReactive: any;
  edit_id: any;
  if_edit = false;
  edit_item: any;
  display_amount: any;

  constructor(
    public modalController: ModalController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    const ifEdit = this.navParams.get('if_edit');
    if (ifEdit) {
      this.edit_id = this.navParams.get('edit_id');
      this.edit_id = parseInt(this.edit_id);
      this.edit_item = this.navParams.get('edit_item');
      this.if_edit = true;
    }

    this.ibanReactive = new FormControl(
      null,
        [
          Validators.required,
          ValidatorService.validateIban
        ]
    );

    this.form = this.formBuilder.group({
      account_holder: ['', Validators.required],
      ibanReactive: this.ibanReactive,
      date:['', Validators.required],
      amount:['', Validators.required],
      note:['', Validators.required],
    });

    if (this.if_edit) {
      this.form.setValue({
        account_holder: this.edit_item.account_holder,
        ibanReactive: this.edit_item.ibanReactive,
        date: this.edit_item.date,
        amount: this.edit_item.amount,
        note: this.edit_item.note,
      })
    }
   }

  ngOnInit() {

  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async submitHandler() {
    const formValue = this.form.value;
    
    if (!this.if_edit) {
      if (this.check_form_validation()) {
        let transcation = JSON.parse(localStorage.getItem('transactions'));
        if(transcation==null){
          transcation=[];
        }
        transcation.push(formValue);
        localStorage.setItem('transactions', JSON.stringify(transcation));
        this.dismiss();
      }
    }

  if (this.if_edit) {
    if (this.check_form_validation()) {

    let transcation=JSON.parse( localStorage.getItem('transactions'));
    if(transcation==null){
      transcation=[];
    }
    transcation[this.edit_id]=formValue;
    localStorage.setItem('transactions', JSON.stringify(transcation));
    this.dismiss();
  }
  }
  }

  check_form_validation() {
    let date = this.form.value.date;
    if (date === '' || date == undefined || date == null) {
      return false;
    }
    date = date.toString();
    date = date.split('T')[0]
    this.form.value.date = date;


    let amount = this.form.value.amount;
    amount = amount.toString();
    amount = amount.replace(/\,/g, '');
    if (amount.includes('.')) {
      let decimalPlaces = amount.split('.')[1];
      decimalPlaces = decimalPlaces.toString();
      if (decimalPlaces.length > 2) {
        this.presentToast("Please give upto 2 decimal place amount");
        return false;
      }
    }

    if (!this.alphanumeric(amount)) {
      this.presentToast("Please dont give any alphabet in amount");
      return false;
    }
    if (amount.length < 2) {
      this.presentToast("Sorry, minimum length of amount must be 2 digits");
      return false;
    }
    amount = parseInt(amount);
    if (amount < 50) {
      this.presentToast("Sorry, minimum amount limit is 50");
      return false;
    }
    if (amount > 20000000) {
      this.presentToast("Sorry, maximum amount limit is 20000000");
      return false;
    }
    
    this.form.value.amount = amount;
    return true;
  }

  alphanumeric(inputtxt)
{
 const letterNumber = /^[0-9]+$/;
 if(inputtxt.match(letterNumber)) 
  {
   return true;
  }
else
  { 
   return false; 
  }
  }

  async presentToast(message) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  auto_format(num) {
    num = num.replace(/\,/g,'');
    if (Number.isNaN(parseInt(num))) {
      num=num.replace(/\,/g,''); // 1125, but num string, so convert it to number
num=parseInt(num,10);
    }
    let num1 = new Intl.NumberFormat('en-IN').format(num)
    this.form.controls['amount'].setValue(num1);
  }
}

