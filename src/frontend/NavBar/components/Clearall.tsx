import URL from 'src/backend/URL.ts';

namespace Clear_routes{

    export function Clear_Routes(){
        var url_routes = URL.getRoutes(); 
        console.log(url_routes);
        for(let route of url_routes){
            console.log(url_routes.size + "size"); 
            URL.removeRoute(route);
            console.log(URL.getRoutes() + "after delete");
        }
    }
}
export default Clear_routes