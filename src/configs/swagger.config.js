/** @format */

const url = '';

const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
 */
import Request from 'utils/Request';
class </parentFunName/> {
  </childFunList/>
}
export default new </parentFunName/>`;
const Center = 'Data';
const childFunTemplate = `
  /**
</childInfo/>
</childParams/>
   */
    public async </childFunName/> ({</childrenParams/>}: {</childrenParaTypes/>) {
      return Request({
        </childrenUrl/>,
        method:</childrenMetHod/>,
        data: </childrenName/>,
        query: {</QueryNames/>},
        app: </Centername/>,
        version: </version/>,
      })
    }
`;

const outputPath = 'Services';

const excludeParamName = [
  'Application-Key',
  'Access-Token',
  'extFields',
  'yes.req.instanceId',
  'yes.req.tenantId',
  'yes.req.applicationId'
];

const config = {
  childFunTemplate,
  excludeParamName,
  outputPath,
  parentFunTemplate,
  url,
  center: Center
};

module.exports = config;
