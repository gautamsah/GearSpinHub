import { LightningElement } from 'lwc';
import Id from "@salesforce/user/Id";
import getAllCourses from '@salesforce/apex/CcAllCourses.getAllCourses';

export default class GshAllProducts extends LightningElement {
    allCourses;
    isLoaded = true;

    connectedCallback() {
        getAllCourses({ userId: Id }).then((result) => {
            console.log(JSON.stringify(result));
            this.allCourses = result;
            this.isLoaded = false;
        })
    }

    handleCourses(e) {
        this.allCourses = this.allCourses.filter(course => course.Id != e.detail.id);
        console.log(JSON.stringify(this.allCourses));
    }
}