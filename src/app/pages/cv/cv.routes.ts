import { Routes } from "@angular/router";
import { CvDetailsComponent } from "./cv-details/cv-details.component";
import { CvComponent } from "./cv.component";

export const routes: Routes = [
    {
        path: '',
        component: CvComponent
    },
    {
        path: 'add',
        component: CvDetailsComponent
    },
    {
        path: 'edit',
        component: CvDetailsComponent
    }
]