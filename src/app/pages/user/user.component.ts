import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, TableModule, DialogModule, HttpClientModule, ToastModule, PasswordModule],
  providers: [CommonService, MessageService, DatePipe],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {

  header = [
    { colum: 'S.no', field: 'no' },
    { colum: 'User Name', field: 'userName' },
    { colum: 'Email', field: 'email' },
    { colum: 'Action', field: 'action' }
  ];
  visible: boolean = false;
  mode: string = 'Add';
  userForm!: FormGroup;
  getUserList = [];
  subscriptions: Subscription[] = [];

  get formControls(): { [key: string]: AbstractControl<any, any>; } {
    return this.userForm.controls;
  }

  constructor(private fb: FormBuilder, private commonservice: CommonService, private messageService: MessageService) {
    this.userForm = this.fb.group({
      userID: [''],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.visible = false;
  }

  openModel(mode: string = 'Add', data: any = {}) {
    this.visible = true;
    this.mode = mode;
    if (this.mode != 'Add') {
      this.userForm.patchValue(data);
    }
    this.getData();
  }

  getData() {
    this.commonservice.post('/users/list', {}).subscribe((res: any) => {
      if (res.status) {
        this.getUserList = res.data;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }

  submit() {
    if (this.userForm.valid) {
      const param = this.userForm.getRawValue();
      const createAPI = this.commonservice.post(`/users/${this.mode === 'Add' ? 'create' : 'update'}`, param).subscribe((res: any) => {
        if (res.status) {
          this.userForm.reset();
          this.visible = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
      });
      this.subscriptions.push(createAPI);
    }else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please entry all required fields' });
    }
  }

  delete(userID: null) {
    if (userID) {
      const deleteAPI = this.commonservice.post('/users/delete', { userID }).subscribe((res: any) => {
        if (res.status) {
          this.getData();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
      });
      this.subscriptions.push(deleteAPI);
    }
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User Id is empty' });
  }

}
