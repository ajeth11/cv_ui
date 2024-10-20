import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { CommonService } from '../../../service/common.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-cv-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, InputTextareaModule, ButtonModule, CardModule, CalendarModule, CheckboxModule, ChipsModule, ToastModule, HttpClientModule, ScrollPanelModule, PanelModule],
  providers: [CommonService, MessageService, DatePipe],
  templateUrl: './cv-details.component.html',
  styleUrl: './cv-details.component.scss'
})
export class CvDetailsComponent implements OnInit {

  cvFrom!: FormGroup;
  mode: string = 'add';
  isExperience: boolean = true;
  isEducation: boolean = true;
  data: any = {};
  subscriptions: Subscription[] = [];

  get formControls(): { [key: string]: AbstractControl<any, any>; } {
    return this.cvFrom.controls;
  }

  get experienceControls() {
    const arrayControl = this.cvFrom.get('experience') as FormArray;
    return arrayControl?.controls ? arrayControl.controls : [];
  }

  get educationControls() {
    const arrayControl = this.cvFrom.get('education') as FormArray;
    return arrayControl?.controls ? arrayControl.controls : [];
  }

  constructor(private fb: FormBuilder, private commonservice: CommonService, private messageService: MessageService, private router: Router, private route: ActivatedRoute) {
    this.cvFrom = this.fb.group({
      cvID: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      phoneNo: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      summary: ['', [Validators.required]],
      experience: this.fb.array([this.fb.group({
        companyName: ['', [Validators.required, Validators.minLength(3)]],
        role: ['', [Validators.required]],
        location: ['', [Validators.required]],
        joinMonth: [null, [Validators.required]],
        isPresent: [false],
        endMonth: [null, [Validators.required]],
      })]),
      education: this.fb.array([this.fb.group({
        schoolName: ['', [Validators.required]],
        qualificaton: ['', [Validators.required]],
        location: ['', [Validators.required]],
        joinMonth: [null, [Validators.required]],
        isPresent: [false],
        endMonth: [null, [Validators.required]],
      })]),
      skill: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.commonservice.data$.subscribe((param:any) => {
      if (!param) {
        const localData: any = localStorage.getItem('cv-details');
        localStorage.clear();
        param = JSON.parse(localData)
      }
      this.mode = param.mode;
      if (this.mode != 'add') {
        this.isExperience = false;
        this.isEducation = false;
        this.data = param.data;
        this.cvFrom.patchValue(this.data);
        if (this.data.experience.length) {
          this.clearExp();
          this.clearEqu();
          this.data.experience.forEach((el: any) => {
            if (el) {
              this.isExperience = true;
              this.addExperience(el);
            }
          });
        }
        if (this.data.education.length) {
          this.data.education.forEach((el: any) => {
            if (el) {
              this.isEducation = true;
              this.addEducation(el);
            }
          });
        }
      }
    })

  }

  formateDate(isoString: string) {
    return new Date(isoString);
  }

  addExperience(val?: any) {
    const arrayControl = this.cvFrom.get('experience') as FormArray;
    arrayControl.push(this.fb.group({
      companyName: [val?.companyName ? val.companyName : '', [Validators.required, Validators.minLength(3)]],
      role: [val?.role ? val.role : '', [Validators.required]],
      location: [val?.location ? val.location : '', [Validators.required, Validators.minLength(3)]],
      joinMonth: [val?.joinMonth ? this.formateDate(val.joinMonth) : null, [Validators.required]],
      isPresent: [val?.isPresent ? val.isPresent : false],
      endMonth: [{ value: val?.endMonth && !val?.isPresent ? val.endMonth : '', disabled: val?.isPresent || false }, [Validators.required]],
    }));
  }

  removeExperience(index: number) {
    const arrayControl = this.cvFrom.get('experience') as FormArray;
    arrayControl.controls.splice(index, 1);
  }

  addEducation(val?: any) {
    const arrayControl = this.cvFrom.get('education') as FormArray;
    arrayControl.push(this.fb.group({
      schoolName: [val?.schoolName ? val.schoolName : '', [Validators.required, Validators.minLength(3)]],
      qualificaton: [val?.qualificaton ? val.qualificaton : '', [Validators.required]],
      location: [val?.location ? val.location : '', [Validators.required, Validators.minLength(3)]],
      joinMonth: [val?.joinMonth ? val.joinMonth : '', [Validators.required]],
      isPresent: [val?.isPresent ? val.isPresent : false],
      endMonth: [{ value: val?.endMonth && !val?.isPresent ? val.endMonth : '', disabled: val?.isPresent || false }, [Validators.required]],
    }));
  }

  removeEducation(index: number) {
    const arrayControl = this.cvFrom.get('education') as FormArray;
    arrayControl.controls.splice(index, 1);
  }

  selectPresent(title: 'experience' | 'education', i: number, val: boolean) {
    const arrayControl = this.cvFrom.get(title) as FormArray;
    const endMonthControl = arrayControl.controls[i].get('endMonth');

    if (endMonthControl) {
      if (val) {
        endMonthControl.clearValidators();
        endMonthControl.reset();
        endMonthControl.disable();
      } else {
        endMonthControl.setValidators([Validators.required]);
        endMonthControl.enable();
      }
      endMonthControl.updateValueAndValidity();
    }
  }

  clearExp() {
    const experienceArray = this.cvFrom.get('experience') as FormArray;
    experienceArray.clear();
  }

  clearEqu() {
    const educationArray = this.cvFrom.get('education') as FormArray;
    educationArray.clear();
  }

  submit() {
    if (!this.isExperience) {
      this.clearExp();
    }

    if (!this.isEducation) {
      this.clearEqu();
    }

    if (this.cvFrom.valid) {
      const param = this.cvFrom.getRawValue();
      this.commonservice.post(`/cv/${this.mode === 'add' ? 'create' : 'update'}`, param).subscribe((res: any) => {
        if (res.status) {
          this.cvFrom.reset();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          setTimeout(() => {
            this.back();
          }, 900);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message });
        }
      });
    }
  }

  back() {
    this.router.navigate(['cv']);
  }
}
