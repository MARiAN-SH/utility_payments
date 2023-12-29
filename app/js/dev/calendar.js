import AirDatepicker from "air-datepicker";
import localeEn from "air-datepicker/locale/en";
import "air-datepicker/air-datepicker.css";

const g = document.getElementById("cl");
if (g.value) {
    console.dir(g.value);
} else {
    console.log("ніц");
}
new AirDatepicker("#cl", { locale: localeEn });
