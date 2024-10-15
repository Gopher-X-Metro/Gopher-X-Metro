import URL from 'src/backend/URL.ts';
import Routes from 'src/frontend/Pages/Map/components/Routes';


namespace Clear_routes{



    export function Clear_all(){
        var test = URL.getRoutes(); 
        console.log(test);
        for(let i =0; i < test.size; i++){
            console.log(test[i]);
            
            URL.removeRoute(test[i]);
          
           
        }
    }

}
export default Clear_routes