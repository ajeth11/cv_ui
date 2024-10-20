import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonService } from '../../service/common.service';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, ButtonModule, TableModule, HttpClientModule, ToastModule, DialogModule],
  providers: [CommonService, MessageService, DatePipe],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss'
})
export class CvComponent implements OnInit {

  header = [
    { colum: 'S.no', field: 'no' },
    { colum: 'Name', field: 'name' },
    { colum: 'Email', field: 'email' },
    { colum: 'Phone No', field: 'phoneNo' },
    { colum: 'Action', field: 'action' }
  ];
  getCVList: any = [];
  displayModal: boolean = false;
  pdfSrc: any = '';

  constructor(private router: Router, private commonservice: CommonService, private messageService: MessageService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getData();
  }

  redirectToDetails(mode = 'add', data?: any) {
    const param = data ? { mode: "edit", data: data } : { mode: "add" };
    this.commonservice.setRow(param)
    localStorage.setItem('cv-details', JSON.stringify(param))
    this.router.navigate(['cv', `${mode === 'add' ? 'add' : 'edit'}`]);
  }

  getData() {
    this.commonservice.post('/cv/list', {}).subscribe((res: any) => {
      if (res.status) {
        this.getCVList = res.data || [];
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }

  deleteObj(cvID: number) {
    this.commonservice.post('/cv/delete', { cvID }).subscribe((res: any) => {
      if (res.status) {
        this.getData();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
      }
    });
  }

  exportPDF(data: any, isDownload = true) {
    if (!isDownload) {
      this.displayModal = true;
      const pdfDataUri: any = this.commonservice.generateResumePDF(data, false);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfDataUri);
    } else {
      this.commonservice.generateResumePDF(data)
    }
  }

}
