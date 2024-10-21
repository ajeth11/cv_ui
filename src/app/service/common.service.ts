import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, Subject, Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  private dataSubject = new BehaviorSubject(null); 
  data$ = this.dataSubject.asObservable();
  private triggerEvent = new Subject<any>();
  
  constructor(private httpClient: HttpClient, private datePipe: DatePipe) { }

  getBaseURL() {
    return 'http://localhost:3000/api';
  }
  
  setRow(newData: any) {
    this.dataSubject.next(newData);
  }

   emitEvent(event: any) {
    this.triggerEvent.next(event);
  }

  onEventTrigger(eventName: string, action: any): Subscription {
    return this.triggerEvent.pipe(
      filter((e: any) => e.name === eventName),
      map((e: any) => e["value"])).subscribe(action);
  }

  post(urlPath: string, payLoad?: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = this.getBaseURL() + urlPath;
    return this.httpClient.post(url, payLoad, httpOptions);
  }

  generateResumePDF(data: any, isDownload = true) {
    const doc = new jsPDF();
    const startHeadingIndex = 10;
    const startIndex = startHeadingIndex + 5;

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', '');

    // CV TITLE
    doc.setFontSize(20);
    doc.text('Resume', 105, 20, { align: 'center' });

    // CV PERSON DETAILS
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.name}`, pageWidth - startHeadingIndex, 30, { align: 'right' });
    doc.setFont('helvetica', '');
    doc.setFontSize(11);
    doc.text(`${data.email}`, pageWidth - startHeadingIndex, 35, { align: 'right' });
    doc.text(`${data.phoneNo}`, pageWidth - startHeadingIndex, 40, { align: 'right' });
    doc.line(startHeadingIndex, 42, 200, 42);

    // CV SUMMARY
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`SUMMARY`, startHeadingIndex, 50);
    doc.setFont('helvetica', '');
    doc.setFontSize(10);
    // doc.text(data.summary, startIndex, 60, { maxWidth: 180 });
    const summaryHeight = this.getTaskLineSize(doc, data.summary, 10, 0.5, 15, 60, 180, '', 100);

    let educationHeight = 0;
    // CV EDUCATION
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', startHeadingIndex, 70 + summaryHeight);
    doc.setFont('helvetica', '');
    data.education.forEach((edu: any, index: number) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('gray');
      doc.text(`${edu.qualificaton}`, startIndex, (80 + summaryHeight) + index * 10);
      doc.setTextColor('black');
      doc.setFont('helvetica', '');
      doc.text(`From   -   To`, pageWidth - startIndex - 5, (80 + summaryHeight) + index * 10, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${edu.schoolName}`, startIndex, (85 + summaryHeight) + index * 10);
      doc.text(`${this.formatDate(edu.joinMonth)} - ${edu.isPresent ? 'Present' : this.formatDate(edu.endMonth)}`, pageWidth - startIndex, (85 + summaryHeight) + index * 10, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', '');
      doc.setTextColor('black');
      doc.text(`${edu.location}`, startIndex, (90 + summaryHeight) + index * 10);
      educationHeight = (90 + summaryHeight) + index * 10;
    });

    let experienceHeight = 0;
    // CV EXPERIENCE
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPERIENCE', startHeadingIndex, educationHeight + 20);
    doc.setFont('helvetica', '');
    data.experience.forEach((exp: any, index: number) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('gray');
      doc.text(`${exp.role}`, startIndex, (educationHeight + 30) + index * 20);
      doc.setTextColor('black');
      doc.setFont('helvetica', '');
      doc.text(`From   -   To`, pageWidth - startIndex - 5, (educationHeight + 30) + index * 10, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.companyName}`, startIndex, (educationHeight + 35) + index * 20);
      doc.text(`${this.formatDate(exp.joinMonth)} - ${exp.isPresent ? 'Present' : this.formatDate(exp.endMonth)}`, pageWidth - startIndex, (educationHeight + 35) + index * 10, { align: 'right' });
      doc.setFontSize(10);
      doc.setFont('helvetica', '');
      doc.text(`${exp.location}`, startIndex, (educationHeight + 40) + index * 20);
      experienceHeight = (educationHeight + 40) + index * 20;
    });

    // Cv SKILL
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', 10, experienceHeight + 20);
    const skillsLine = data.skill.join(', ');
    const splitSkill = doc.splitTextToSize(skillsLine, pageWidth);
    doc.setFontSize(12);
    doc.text(`${splitSkill}`, 15, experienceHeight+ 30);

    if (!isDownload) {
      return doc.output('datauristring');
    }

    doc.save('resume.pdf');
    return;
  }

  getTaskLineSize(doc: any, text: string, fontSize: number, lineHeight: number, x: number, y: number, maxWidth: number, nextText: string, nextY: number) {
    let line: string[];
    const avgHig = nextY - y;
    do {
      doc.setFontSize(fontSize);
      line = doc.splitTextToSize(text, maxWidth);

      if (line.length * fontSize * lineHeight > avgHig) {
        fontSize--;
      }
    } while (line.length * fontSize * lineHeight > avgHig && fontSize > 6);

    for (let i = 0; i < line.length; i++) {
      doc.text(line[i], x, y + (fontSize * lineHeight * i));
    }

    return line.length * fontSize * lineHeight;
  }

  formatDate(dateStr: string) {
    const date= this.datePipe.transform(dateStr, 'MM-yyyy');
    return date;
  }
}
